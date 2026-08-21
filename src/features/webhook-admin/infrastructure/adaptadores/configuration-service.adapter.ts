import { WebhookConfigRegistry } from '../servicios/webhook-config-registry.service';
import { StatusBasedDisableConfigService } from '../../../../services/status_based_disable_config';
import { ServiceConfigRegistry } from '../../../../services/service_config_registry';
import { WebhookConfigurationPort } from '../../domain/interfaces/webhook-configuration.port';
import { StatusBasedDisablePort } from '../../domain/interfaces/status-based-disable.port';
import { WebhookServiceRegistryPort } from '../../domain/interfaces/webhook-service-registry.port';
import { WebhookConfiguration, ServiceConfiguration } from '../../domain/modelos/webhook-configuration.model';
import { WebhookFilterConfig } from '../../domain/modelos/webhook-filter-config.model';
import { StatusBasedDisableConfig } from '../../domain/modelos/status-based-disable-config.model';

/**
 * Envuelve los singletons legacy que manejan webhook config, status-based-disable
 * config y el registro de servicios (cada uno en memoria, independientes entre sí).
 */
export class ConfigurationServiceAdapter
  implements WebhookConfigurationPort, StatusBasedDisablePort, WebhookServiceRegistryPort {
  private readonly webhookConfig: WebhookConfigRegistry;
  private readonly statusBasedDisable: StatusBasedDisableConfigService;
  private readonly serviceConfig: ServiceConfigRegistry;

  constructor() {
    this.webhookConfig = WebhookConfigRegistry.getInstance();
    this.statusBasedDisable = StatusBasedDisableConfigService.getInstance();
    this.serviceConfig = ServiceConfigRegistry.getInstance();
  }

  getWebhookUrl(): string | null {
    return this.webhookConfig.getWebhookUrl();
  }

  async setWebhookUrl(webhookUrl: string): Promise<void> {
    await this.webhookConfig.setWebhookUrl(webhookUrl);
  }

  isWebhookEnabled(): boolean {
    return this.webhookConfig.isWebhookEnabled();
  }

  async setWebhookEnabled(isEnabled: boolean): Promise<void> {
    await this.webhookConfig.setWebhookEnabled(isEnabled);
  }

  getWebhookConfiguration(): WebhookConfiguration | null {
    return this.webhookConfig.getWebhookConfiguration();
  }

  async disableWebhook(): Promise<void> {
    await this.webhookConfig.disableWebhook();
  }

  getWebhookFilterConfig(): WebhookFilterConfig | null {
    return this.webhookConfig.getWebhookFilterConfig();
  }

  async setWebhookFilter(filterEnabled: boolean, filterCondition: string, filterValue: string): Promise<void> {
    await this.webhookConfig.setWebhookFilter(filterEnabled, filterCondition, filterValue);
  }

  shouldSendWebhook(assistantResponse: any): boolean {
    return this.webhookConfig.shouldSendWebhook(assistantResponse);
  }

  getStatusBasedDisableConfig(): StatusBasedDisableConfig {
    return this.statusBasedDisable.getStatusBasedDisableConfig();
  }

  async setStatusBasedDisableConfig(isEnabled: boolean, triggerStatuses: string[]): Promise<void> {
    await this.statusBasedDisable.setStatusBasedDisableConfig(isEnabled, triggerStatuses);
  }

  getServiceConfiguration(serviceId: string): ServiceConfiguration | null {
    return this.serviceConfig.getServiceConfiguration(serviceId);
  }

  async updateServiceConfiguration(serviceId: string, assistantId: string, assistantName: string): Promise<boolean> {
    return this.serviceConfig.updateServiceConfiguration(serviceId, assistantId, assistantName);
  }

  toggleService(serviceId: string, isActive: boolean): boolean {
    return this.serviceConfig.toggleService(serviceId, isActive);
  }
}
