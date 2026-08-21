import { UserInstancesRepositoryPort } from '../domain/interfaces/user-instances-repository.port';

export class DeleteInstanceUseCase {
  constructor(private readonly userInstances: UserInstancesRepositoryPort) {}

  async execute(userId: number, id: number): Promise<void> {
    await this.userInstances.delete(userId, id);
  }
}
