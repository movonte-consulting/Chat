import { UserRegistrationRepositoryPort } from '../domain/interfaces/user-registration-repository.port';
import { PasswordHasherPort } from '../domain/interfaces/password-hasher.port';
import { LegacyUser } from '../domain/modelos/legacy-user.model';

const DEFAULT_PERMISSIONS = {
  serviceManagement: false,
  automaticAIDisableRules: false,
  webhookConfiguration: false,
  ticketControl: false,
  aiEnabledProjects: false,
  remoteServerIntegration: false
};

export type RegisterUserResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'duplicate' }
  | { kind: 'ok'; data: LegacyUser };

export class RegisterUserUseCase {
  constructor(
    private readonly userRegistration: UserRegistrationRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort
  ) {}

  async execute(
    adminId: number,
    username: string | undefined,
    email: string | undefined,
    password: string | undefined,
    role: string | undefined,
    permissions: any
  ): Promise<RegisterUserResult> {
    if (!username || !email || !password) {
      return { kind: 'validation_error', message: 'username, email y password son requeridos' };
    }

    const exists = await this.userRegistration.existsByUsername(username);
    if (exists) {
      return { kind: 'duplicate' };
    }

    const hashedPassword = await this.passwordHasher.hash(password);

    const data = await this.userRegistration.create({
      username,
      email,
      hashedPassword,
      role: role || 'user',
      adminId,
      permissions: permissions || DEFAULT_PERMISSIONS
    });

    return { kind: 'ok', data };
  }
}
