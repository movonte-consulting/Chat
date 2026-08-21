import { ServiceConfiguration, CreateServiceConfigurationInput, UpdateServiceConfigurationInput } from '../modelos/service-configuration.model';

export interface UserServiceConfigurationsRepositoryPort {
  listForUser(userId: number): Promise<ServiceConfiguration[]>;
  findOne(userId: number, serviceId: string): Promise<ServiceConfiguration | null>;
  create(userId: number, input: CreateServiceConfigurationInput): Promise<boolean>;
  update(userId: number, serviceId: string, input: UpdateServiceConfigurationInput): Promise<void>;
  delete(userId: number, serviceId: string): Promise<void>;
}
