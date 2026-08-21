import { UserCredentialsRepositoryPort } from '../domain/interfaces/user-credentials-repository.port';
import { PasswordHasherPort } from '../domain/interfaces/password-hasher.port';

export type ChangePasswordResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'not_found' }
  | { kind: 'invalid_current_password' }
  | { kind: 'ok' };

export class ChangePasswordUseCase {
  constructor(
    private readonly userCredentials: UserCredentialsRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort
  ) {}

  async execute(userId: number, currentPassword: string | undefined, newPassword: string | undefined): Promise<ChangePasswordResult> {
    if (!currentPassword || !newPassword) {
      return { kind: 'validation_error', message: 'Current password y new password son requeridos' };
    }

    if (newPassword.length < 6) {
      return { kind: 'validation_error', message: 'La nueva contraseña debe tener al menos 6 caracteres' };
    }

    const user = await this.userCredentials.findById(userId);
    if (!user) {
      return { kind: 'not_found' };
    }

    const isValidPassword = await this.passwordHasher.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return { kind: 'invalid_current_password' };
    }

    const hashedPassword = await this.passwordHasher.hash(newPassword);
    await this.userCredentials.updatePassword(userId, hashedPassword);

    return { kind: 'ok' };
  }
}
