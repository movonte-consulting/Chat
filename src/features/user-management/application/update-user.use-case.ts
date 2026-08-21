import { UserRepositoryPort } from '../domain/interfaces/user-repository.port';
import { ManagedUser } from '../domain/modelos/managed-user.model';

export type UpdateUserResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'not_found' }
  | { kind: 'forbidden' }
  | { kind: 'duplicate' }
  | { kind: 'ok'; data: ManagedUser };

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(
    adminId: number,
    id: string,
    body: { username?: string; email?: string; role?: string; isActive?: boolean }
  ): Promise<UpdateUserResult> {
    const { username, email, role, isActive } = body;

    const user = await this.userRepository.findById(id);
    if (!user) {
      return { kind: 'not_found' };
    }

    if (user.adminId !== adminId) {
      return { kind: 'forbidden' };
    }

    if (role && !['admin', 'user'].includes(role)) {
      return { kind: 'validation_error', message: 'Rol inválido. Debe ser "admin" o "user"' };
    }

    if (username || email) {
      const duplicate = await this.userRepository.existsByUsernameOrEmailExcluding(id, username, email);
      if (duplicate) {
        return { kind: 'duplicate' };
      }
    }

    const updateData: { username?: string; email?: string; role?: 'admin' | 'user'; isActive?: boolean } = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role as 'admin' | 'user';
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const data = await this.userRepository.update(id, updateData);

    return { kind: 'ok', data };
  }
}
