import { WebhookConfigurationPort } from '../domain/interfaces/webhook-configuration.port';
import { WebhookServiceRegistryPort } from '../domain/interfaces/webhook-service-registry.port';
import { AssistantCatalogPort } from '../domain/interfaces/assistant-catalog.port';

export type ConfigureWebhookResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'assistant_not_found' }
  | { kind: 'ok'; data: { webhookUrl: string; assistantId: string | null; isEnabled: boolean } };

export class ConfigureWebhookUseCase {
  constructor(
    private readonly webhookConfig: WebhookConfigurationPort,
    private readonly serviceRegistry: WebhookServiceRegistryPort,
    private readonly assistantCatalog: AssistantCatalogPort
  ) {}

  async execute(webhookUrl: string | undefined, assistantId: string | undefined): Promise<ConfigureWebhookResult> {
    if (!webhookUrl) {
      return { kind: 'validation_error', message: 'Se requiere la URL del webhook' };
    }

    console.log(`🔧 Configurando webhook: ${webhookUrl}`);

    await this.webhookConfig.setWebhookUrl(webhookUrl);
    await this.webhookConfig.setWebhookEnabled(true);

    if (assistantId) {
      const assistants = await this.assistantCatalog.listAssistants();
      const assistant = assistants.find(a => a.id === assistantId);

      if (!assistant) {
        return { kind: 'assistant_not_found' };
      }

      await this.serviceRegistry.updateServiceConfiguration(
        'webhook-parallel',
        assistantId,
        assistant.name || 'Webhook Assistant'
      );
      this.serviceRegistry.toggleService('webhook-parallel', true);
      console.log(`✅ Asistente configurado para webhook: ${assistant.name}`);
      console.log(`✅ Servicio webhook-parallel activado`);
    }

    return {
      kind: 'ok',
      data: { webhookUrl, assistantId: assistantId || null, isEnabled: true }
    };
  }
}
