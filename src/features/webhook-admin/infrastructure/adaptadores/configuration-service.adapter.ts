import { ConfigurationService } from '../../../../services/configuration_service';
import { WebhookConfigurationPort } from '../../domain/interfaces/webhook-configuration.port';
import { StatusBasedDisablePort } from '../../domain/interfaces/status-based-disable.port';
import { WebhookServiceRegistryPort } from '../../domain/interfaces/webhook-service-registry.port';
import { WebhookConfiguration, ServiceConfiguration } from '../../domain/modelos/webhook-configuration.model';
import { WebhookFilterConfig } from '../../domain/modelos/webhook-filter-config.model';
import { StatusBasedDisableConfig } from '../../domain/modelos/status-based-disable-config.model';

/**
 * Envuelve el singleton legacy ConfigurationService, que maneja webhook config,
 * status-based-disable config y el registro de servicios (todo en memoria).
 */
export class ConfigurationServiceAdapter
  implements WebhookConfigurationPort, StatusBasedDisablePort, WebhookServiceRegistryPort {
  private readonly configService: ConfigurationService;

  constructor() {
    this.configService = ConfigurationService.getInstance();
  }

  getWebhookUrl(): string | null {
    return this.configService.getWebhookUrl();
  }

  async setWebhookUrl(webhookUrl: string): Promise<void> {
    await this.configService.setWebhookUrl(webhookUrl);
  }

  isWebhookEnabled(): boolean {
    return this.configService.isWebhookEnabled();
  }

  async setWebhookEnabled(isEnabled: boolean): Promise<void> {
    await this.configService.setWebhookEnabled(isEnabled);
  }

  getWebhookConfiguration(): WebhookConfiguration | null {
    return this.configService.getWebhookConfiguration();
  }

  async disableWebhook(): Promise<void> {
    await this.configService.disableWebhook();
  }

  getWebhookFilterConfig(): WebhookFilterConfig | null {
    return this.configService.getWebhookFilterConfig();
  }

  async setWebhookFilter(filterEnabled: boolean, filterCondition: string, filterValue: string): Promise<void> {
    await this.configService.setWebhookFilter(filterEnabled, filterCondition, filterValue);
  }

  shouldSendWebhook(assistantResponse: any): boolean {
    return this.configService.shouldSendWebhook(assistantResponse);
  }

  getStatusBasedDisableConfig(): StatusBasedDisableConfig {
    return this.configService.getStatusBasedDisableConfig();
  }

  async setStatusBasedDisableConfig(isEnabled: boolean, triggerStatuses: string[]): Promise<void> {
    await this.configService.setStatusBasedDisableConfig(isEnabled, triggerStatuses);
  }

  getServiceConfiguration(serviceId: string): ServiceConfiguration | null {
    return this.configService.getServiceConfiguration(serviceId);
  }

  async updateServiceConfiguration(serviceId: string, assistantId: string, assistantName: string): Promise<boolean> {
    return this.configService.updateServiceConfiguration(serviceId, assistantId, assistantName);
  }

  toggleService(serviceId: string, isActive: boolean): boolean {
    return this.configService.toggleService(serviceId, isActive);
  }
}
