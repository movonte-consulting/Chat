import { UserRepositoryPort } from '../domain/interfaces/user-repository.port';
import { ManagedUser } from '../domain/modelos/managed-user.model';

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(adminId: number): Promise<ManagedUser[]> {
    return this.userRepository.listByAdmin(adminId);
  }
}
