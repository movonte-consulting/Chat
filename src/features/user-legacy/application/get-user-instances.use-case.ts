import { UserInstancesRepositoryPort } from '../domain/interfaces/user-instances-repository.port';
import { UserInstance } from '../domain/modelos/user-instance.model';

export class GetUserInstancesUseCase {
  constructor(private readonly userInstances: UserInstancesRepositoryPort) {}

  async execute(userId: number): Promise<UserInstance[]> {
    return this.userInstances.list(userId);
  }
}
