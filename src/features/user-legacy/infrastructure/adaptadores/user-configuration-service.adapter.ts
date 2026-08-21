import { UserConfigurationService } from '../../../../services/user_configuration_service';
import { UserInstancesRepositoryPort } from '../../domain/interfaces/user-instances-repository.port';
import { LegacyServiceConfigurationsPort } from '../../domain/interfaces/legacy-service-configurations.port';
import { LegacyWebhookConfigPort } from '../../domain/interfaces/legacy-webhook-config.port';
import { UserInstance, CreateInstanceInput, UpdateInstanceInput } from '../../domain/modelos/user-instance.model';
import { ServiceConfigurationSummary } from '../../domain/modelos/service-configuration-summary.model';
import { UserWebhookConfiguration } from '../../domain/modelos/user-webhook-configuration.model';

/** Envuelve UserConfigurationService.getInstance(userId) — singleton por usuario, en memoria + DB. */
export class UserConfigurationServiceAdapter
  implements UserInstancesRepositoryPort, LegacyServiceConfigurationsPort, LegacyWebhookConfigPort {
  async list(userId: number): Promise<UserInstance[]> {
    const service = UserConfigurationService.getInstance(userId);
    const instances = await service.getUserInstances();
    return instances.map((instance: any) => ({
      id: instance.id,
      instanceName: instance.instanceName,
      instanceDescription: instance.instanceDescription,
      isActive: instance.isActive,
      settings: instance.settings,
      createdAt: instance.createdAt,
      updatedAt: instance.updatedAt
    }));
  }

  async create(userId: number, input: CreateInstanceInput): Promise<UserInstance> {
    const service = UserConfigurationService.getInstance(userId);
    const instance = await service.createInstance(input);
    return {
      id: instance.id,
      instanceName: instance.instanceName,
      instanceDescription: instance.instanceDescription,
      isActive: instance.isActive,
      settings: instance.settings,
      createdAt: instance.createdAt,
      updatedAt: instance.updatedAt
    };
  }

  async update(userId: number, id: number, input: UpdateInstanceInput): Promise<void> {
    const service = UserConfigurationService.getInstance(userId);
    await service.updateInstance(id, input);
  }

  async delete(userId: number, id: number): Promise<void> {
    const service = UserConfigurationService.getInstance(userId);
    await service.deleteInstance(id);
  }

  listAll(userId: number): ServiceConfigurationSummary[] {
    const service = UserConfigurationService.getInstance(userId);
    return service.getAllServiceConfigurations();
  }

  async setConfiguration(
    userId: number,
    serviceId: string,
    serviceName: string,
    assistantId: string,
    assistantName: string,
    isActive: boolean | undefined,
    configuration: any
  ): Promise<void> {
    const service = UserConfigurationService.getInstance(userId);
    await service.setServiceConfiguration(serviceId, serviceName, assistantId, assistantName, isActive, configuration);
  }

  get(userId: number): UserWebhookConfiguration | null {
    const service = UserConfigurationService.getInstance(userId);
    return service.getWebhookConfiguration();
  }

  async set(userId: number, config: UserWebhookConfiguration): Promise<void> {
    const service = UserConfigurationService.getInstance(userId);
    await service.setWebhookConfiguration(config);
  }
}
