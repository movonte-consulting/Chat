import { UserCredentialsProviderPort } from '../domain/interfaces/user-credentials-provider.port';
import { GenericAgentPort } from '../domain/interfaces/generic-agent.port';
import { WhatsAppSenderPort } from '../domain/interfaces/whatsapp-sender.port';
import { RoutableService } from '../domain/modelos/intent-router.model';
import { SwitchToServiceUseCase } from './switch-to-service.use-case';

/**
 * Phase 1: generic AI agent. Returns text + optionally triggers a service switch
 * via function calling. After the agent's text response, always follows up with
 * the interactive services menu.
 */
export class RespondWithGenericAgentUseCase {
  constructor(
    private readonly userCredentialsProvider: UserCredentialsProviderPort,
    private readonly genericAgent: GenericAgentPort,
    private readonly whatsappSender: WhatsAppSenderPort,
    private readonly switchToService: SwitchToServiceUseCase
  ) {}

  async execute(
    phone: string,
    senderName: string,
    text: string,
    services: RoutableService[],
    phoneNumberId: string,
    conv: { user_id: number; openai_thread_id: string | null }
  ): Promise<void> {
    const userId = conv.user_id;

    try {
      const openaiToken = await this.userCredentialsProvider.getOpenAIToken(userId);
      if (!openaiToken) {
        console.warn('⚠️ WhatsApp: no OpenAI token. Sending interactive list.');
        if (phoneNumberId) {
          await this.whatsappSender.sendInteractiveServices(phoneNumberId, phone, services);
        }
        return;
      }

      const result = await this.genericAgent.processMessage(
        openaiToken, userId, phone, text,
        services.map((s) => ({ serviceId: s.serviceId, serviceName: s.serviceName })),
        conv.openai_thread_id
      );

      if (result.type === 'select_service') {
        // Agent detected intent → switch directly
        console.log(`📱 [WhatsApp] Agent triggered switch → ${result.serviceId}`);
        await this.switchToService.execute(
          phone, senderName, text,
          { serviceId: result.serviceId, serviceName: result.serviceName },
          phoneNumberId, conv,
          result.text
        );
        return;
      }

      // Send agent's conversational reply
      if (result.text && phoneNumberId) {
        await this.whatsappSender.sendText(phoneNumberId, phone, result.text);
      }

      // Always follow up with the interactive services menu
      if (phoneNumberId) {
        await this.whatsappSender.sendInteractiveServices(
          phoneNumberId, phone, services,
          'Asistente Movonte',
          'Selecciona el servicio con el que deseas continuar:'
        );
      }
    } catch (err) {
      console.error('❌ WhatsApp: generic agent error:', err);
      if (phoneNumberId) {
        await this.whatsappSender.sendInteractiveServices(phoneNumberId, phone, services).catch(() => {});
      }
    }
  }
}
