import { UserRepositoryPort } from '../domain/interfaces/user-repository.port';
import { PasswordHasherPort } from '../domain/interfaces/password-hasher.port';

export type ChangeUserPasswordResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'not_found' }
  | { kind: 'forbidden' }
  | { kind: 'ok' };

export class ChangeUserPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort
  ) {}

  async execute(adminId: number, id: string, newPassword: string | undefined): Promise<ChangeUserPasswordResult> {
    if (!newPassword) {
      return { kind: 'validation_error', message: 'New password es requerido' };
    }

    if (newPassword.length < 6) {
      return { kind: 'validation_error', message: 'La nueva contraseña debe tener al menos 6 caracteres' };
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      return { kind: 'not_found' };
    }

    if (user.adminId !== adminId) {
      return { kind: 'forbidden' };
    }

    const hashedPassword = await this.passwordHasher.hash(newPassword);
    await this.userRepository.updatePassword(id, hashedPassword);

    return { kind: 'ok' };
  }
}
