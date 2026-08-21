import { UserServiceConfigurationsRepositoryPort } from '../domain/interfaces/user-service-configurations-repository.port';

export type DeleteUserServiceResult =
  | { kind: 'not_found'; serviceId: string }
  | { kind: 'ok' };

export class DeleteUserServiceUseCase {
  constructor(private readonly userServiceConfigurations: UserServiceConfigurationsRepositoryPort) {}

  async execute(userId: number, serviceId: string): Promise<DeleteUserServiceResult> {
    const existingConfig = await this.userServiceConfigurations.findOne(userId, serviceId);
    if (!existingConfig) {
      return { kind: 'not_found', serviceId };
    }

    await this.userServiceConfigurations.delete(userId, serviceId);

    return { kind: 'ok' };
  }
}
