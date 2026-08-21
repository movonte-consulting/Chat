/** Corre un thread ad-hoc de OpenAI contra el asistente de escalación (webhook-parallel). */

import OpenAI from 'openai';
import { EscalationAssistantPort, EscalationAssistantResult } from '../../domain/interfaces/escalation-assistant.port';

const MAX_POLL_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 500;

export class EscalationAssistantAdapter implements EscalationAssistantPort {
  async run(openaiToken: string, assistantId: string, message: string, issueKey: string): Promise<EscalationAssistantResult> {
    const openai = new OpenAI({ apiKey: openaiToken, dangerouslyAllowBrowser: true });

    const thread = await openai.beta.threads.create({
      metadata: { issueKey, source: 'webhook-parallel' }
    });

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message
    });

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId
    });

    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    let attempts = 0;

    while (runStatus.status === 'in_progress' || runStatus.status === 'queued') {
      if (attempts >= MAX_POLL_ATTEMPTS) {
        console.error('Timeout esperando respuesta del asistente de escalación');
        break;
      }
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      attempts++;
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const assistantMessage = messages.data.find((m: any) => m.role === 'assistant');
    const response = assistantMessage?.content[0]?.type === 'text'
      ? (assistantMessage.content[0] as any).text.value
      : '';

    return { response };
  }
}
