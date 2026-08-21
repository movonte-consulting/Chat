import { UserServiceConfigRegistry } from '../servicios/user-service-config-registry.service';
import { UserWebhookConfigRegistry } from '../../../../services/user_webhook_config_registry';
import * as userInstanceService from '../servicios/user-instance.service';
import { UserInstancesRepositoryPort } from '../../domain/interfaces/user-instances-repository.port';
import { LegacyServiceConfigurationsPort } from '../../domain/interfaces/legacy-service-configurations.port';
import { LegacyWebhookConfigPort } from '../../domain/interfaces/legacy-webhook-config.port';
import { UserInstance, CreateInstanceInput, UpdateInstanceInput } from '../../domain/modelos/user-instance.model';
import { ServiceConfigurationSummary } from '../../domain/modelos/service-configuration-summary.model';
import { UserWebhookConfiguration } from '../../domain/modelos/user-webhook-configuration.model';

/** Envuelve UserServiceConfigRegistry/UserWebhookConfigRegistry (singletons por usuario, en memoria + DB) y user_instance_service (sin caché). */
export class UserConfigurationServiceAdapter
  implements UserInstancesRepositoryPort, LegacyServiceConfigurationsPort, LegacyWebhookConfigPort {
  async list(userId: number): Promise<UserInstance[]> {
    const instances = await userInstanceService.getUserInstances(userId);
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
    const instance = await userInstanceService.createInstance(userId, input);
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
    await userInstanceService.updateInstance(userId, id, input);
  }

  async delete(userId: number, id: number): Promise<void> {
    await userInstanceService.deleteInstance(userId, id);
  }

  listAll(userId: number): ServiceConfigurationSummary[] {
    return UserServiceConfigRegistry.getInstance(userId).getAllServiceConfigurations();
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
    await UserServiceConfigRegistry.getInstance(userId).setServiceConfiguration(serviceId, serviceName, assistantId, assistantName, isActive, configuration);
  }

  get(userId: number): UserWebhookConfiguration | null {
    return UserWebhookConfigRegistry.getInstance(userId).getWebhookConfiguration();
  }

  async set(userId: number, config: UserWebhookConfiguration): Promise<void> {
    await UserWebhookConfigRegistry.getInstance(userId).setWebhookConfiguration(config);
  }
}
