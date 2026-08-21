/**
 * OpenAI Assistants API implementation of GenericAgentPort.
 *
 * Uses function calling so the assistant can autonomously detect when a customer
 * has decided on a service and trigger the switch programmatically — without
 * requiring the customer to type an exact number or service name.
 *
 * The assistant has one tool: select_service(service_id: string)
 *
 * When the run returns requires_action with a select_service call, this adapter
 * submits the tool output, collects the assistant's final confirmation message,
 * and returns { type: 'select_service', serviceId, text }.
 *
 * Thread persistence: OpenAI thread IDs are stored via ConversationRepositoryPort
 * so conversation history is maintained across messages.
 */

import OpenAI from 'openai';
import { sequelize } from '../../../../config/database';
import { ConversationRepositoryPort } from '../../domain/interfaces/conversation-repository.port';
import { AgentResult, AvailableService, GenericAgentPort } from '../../domain/interfaces/generic-agent.port';

export class GenericAgentAdapter implements GenericAgentPort {
  constructor(private readonly conversationRepository: ConversationRepositoryPort) {}

  async processMessage(
    openaiToken: string,
    userId: number,
    phone: string,
    messageText: string,
    services: AvailableService[],
    existingThreadId: string | null
  ): Promise<AgentResult> {
    const openai = new OpenAI({ apiKey: openaiToken });

    // ── 1. Get generic assistant ID from unified_configurations ──────────
    const assistantId = await this.getGenericAssistantId(userId);
    if (!assistantId) {
      console.warn('⚠️ WhatsApp agent: whatsapp-generic service not configured in DB. Falling back to list.');
      return { type: 'message', text: '' }; // caller handles fallback
    }

    // ── 2. Get or create OpenAI thread ───────────────────────────────────
    let threadId = existingThreadId;
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      // Persist immediately so even if something fails the thread is saved
      await this.conversationRepository.updateThreadId(phone, threadId);
      console.log(`📱 [WhatsApp Agent] New thread ${threadId} for ${phone}`);
    }

    // ── 3. Build select_service tool with dynamic service IDs ────────────
    const serviceMap = new Map(services.map((s) => [s.serviceId, s.serviceName]));
    const selectServiceTool: OpenAI.Beta.Assistants.AssistantTool = {
      type: 'function',
      function: {
        name: 'select_service',
        description:
          'Call this function ONLY when the customer has clearly and explicitly decided ' +
          'which service they want. Do NOT call it when the customer is still asking questions ' +
          'or has not yet committed to a specific service.',
        parameters: {
          type: 'object',
          properties: {
            service_id: {
              type: 'string',
              enum: services.map((s) => s.serviceId),
              description: 'The service_id of the service the customer chose.'
            }
          },
          required: ['service_id']
        }
      }
    };

    // Build the services list for context
    const servicesList = services.map((s, i) => `${i + 1}. ${s.serviceName} (id: ${s.serviceId})`).join('\n');
    const additionalInstructions =
      `Servicios disponibles actualmente:\n${servicesList}\n\n` +
      `Cuando el cliente haya decidido claramente qué servicio quiere, llama a la función select_service con el service_id correspondiente. ` +
      `Antes del switch, confirma brevemente al cliente a qué servicio lo estás conectando.`;

    // ── 4. Add customer message to thread ────────────────────────────────
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: messageText
    });

    // ── 5. Create run with the select_service tool ───────────────────────
    let run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
      tools: [selectServiceTool],
      additional_instructions: additionalInstructions
    });

    // ── 6. Poll until terminal state ─────────────────────────────────────
    const MAX_POLLS = 60;
    let polls = 0;

    while (
      (run.status === 'queued' || run.status === 'in_progress' || run.status === 'requires_action') &&
      polls < MAX_POLLS
    ) {
      if (run.status === 'requires_action') {
        // ── Function call detected ────────────────────────────────────────
        const toolCalls = run.required_action?.submit_tool_outputs?.tool_calls ?? [];
        const selectCall = toolCalls.find((tc) => tc.function.name === 'select_service');

        if (selectCall) {
          let args: { service_id?: string } = {};
          try {
            args = JSON.parse(selectCall.function.arguments || '{}');
          } catch {
            args = {};
          }

          const chosenServiceId = args.service_id ?? '';
          const chosenServiceName = serviceMap.get(chosenServiceId) ?? chosenServiceId;

          console.log(`📱 [WhatsApp Agent] select_service called: ${chosenServiceId} (${chosenServiceName})`);

          // Submit tool output so the assistant can write its final reply
          run = await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
            tool_outputs: [
              {
                tool_call_id: selectCall.id,
                output: JSON.stringify({
                  success: true,
                  service_id: chosenServiceId,
                  service_name: chosenServiceName
                })
              }
            ]
          });

          // Wait for the run to complete after tool submission
          polls = 0;
          while (
            (run.status === 'queued' || run.status === 'in_progress') &&
            polls < MAX_POLLS
          ) {
            await new Promise((r) => setTimeout(r, 1000));
            run = await openai.beta.threads.runs.retrieve(threadId, run.id);
            polls++;
          }

          if (run.status === 'completed') {
            const msgs = await openai.beta.threads.messages.list(threadId, { limit: 1 });
            const lastMsg = msgs.data[0];
            const confirmationText =
              lastMsg?.role === 'assistant' && lastMsg.content[0]?.type === 'text'
                ? lastMsg.content[0].text.value
                : `Te conecto ahora con *${chosenServiceName}*.`;

            return {
              type: 'select_service',
              serviceId: chosenServiceId,
              serviceName: chosenServiceName,
              text: confirmationText
            };
          }

          // Run failed after tool submission
          console.error(`❌ [WhatsApp Agent] Run ${run.id} failed after tool submission: ${run.status}`);
          return { type: 'message', text: '' };
        }

        // Unknown tool call – cancel and fall through to error
        console.warn('[WhatsApp Agent] Unknown tool call, cancelling run.');
        await openai.beta.threads.runs.cancel(threadId, run.id).catch(() => {});
        return { type: 'message', text: '' };
      }

      await new Promise((r) => setTimeout(r, 1000));
      run = await openai.beta.threads.runs.retrieve(threadId, run.id);
      polls++;
    }

    // ── 7. Collect final text response ───────────────────────────────────
    if (run.status === 'completed') {
      const msgs = await openai.beta.threads.messages.list(threadId, { limit: 1 });
      const lastMsg = msgs.data[0];
      const text =
        lastMsg?.role === 'assistant' && lastMsg.content[0]?.type === 'text'
          ? lastMsg.content[0].text.value
          : '';

      return { type: 'message', text };
    }

    console.error(`❌ [WhatsApp Agent] Run ended with status: ${run.status}`);
    return { type: 'message', text: '' };
  }

  /** Load the assistant_id for the whatsapp-generic service from unified_configurations. */
  private async getGenericAssistantId(userId: number): Promise<string | null> {
    const [rows] = await sequelize.query(
      `SELECT assistant_id FROM unified_configurations
       WHERE user_id = :userId AND service_id = 'whatsapp-generic' AND is_active = TRUE
       LIMIT 1`,
      { replacements: { userId } }
    ) as [any[], unknown];
    return rows?.[0]?.assistant_id ?? null;
  }
}
