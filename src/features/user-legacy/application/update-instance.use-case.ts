import { UserInstancesRepositoryPort } from '../domain/interfaces/user-instances-repository.port';

export class UpdateInstanceUseCase {
  constructor(private readonly userInstances: UserInstancesRepositoryPort) {}

  async execute(
    userId: number,
    id: number,
    instanceName: string | undefined,
    instanceDescription: string | undefined,
    isActive: boolean | undefined,
    settings: any
  ): Promise<void> {
    await this.userInstances.update(userId, id, { instanceName, instanceDescription, isActive, settings });
  }
}
