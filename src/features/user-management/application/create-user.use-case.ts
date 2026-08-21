import { UserRepositoryPort } from '../domain/interfaces/user-repository.port';
import { PasswordHasherPort } from '../domain/interfaces/password-hasher.port';
import { ManagedUser } from '../domain/modelos/managed-user.model';

export type CreateUserResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'duplicate' }
  | { kind: 'ok'; data: ManagedUser };

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort
  ) {}

  async execute(
    adminId: number,
    username: string | undefined,
    email: string | undefined,
    password: string | undefined,
    role: string = 'user'
  ): Promise<CreateUserResult> {
    if (!username || !email || !password) {
      return { kind: 'validation_error', message: 'Username, email y password son requeridos' };
    }

    if (password.length < 6) {
      return { kind: 'validation_error', message: 'La contraseña debe tener al menos 6 caracteres' };
    }

    if (!['admin', 'user'].includes(role)) {
      return { kind: 'validation_error', message: 'Rol inválido. Debe ser "admin" o "user"' };
    }

    const exists = await this.userRepository.existsByUsernameOrEmail(username, email);
    if (exists) {
      return { kind: 'duplicate' };
    }

    const hashedPassword = await this.passwordHasher.hash(password);

    const data = await this.userRepository.create({ username, email, hashedPassword, role: role as 'admin' | 'user', adminId });

    return { kind: 'ok', data };
  }
}
