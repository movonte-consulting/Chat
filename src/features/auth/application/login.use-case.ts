import { UserCredentialsRepositoryPort } from '../domain/interfaces/user-credentials-repository.port';
import { TokenIssuerPort } from '../domain/interfaces/token-issuer.port';
import { PasswordHasherPort } from '../domain/interfaces/password-hasher.port';
import { LoginResult } from '../domain/modelos/login-result.model';

export type LoginResultOutcome =
  | { kind: 'validation_error'; message: string }
  | { kind: 'invalid_credentials' }
  | { kind: 'inactive' }
  | { kind: 'ok'; data: LoginResult };

function computeIsSetupComplete(user: { role: string; isInitialSetupComplete: boolean; jiraToken: string | null; openaiToken: string | null }): boolean {
  const hasTokens = !!(user.jiraToken && user.openaiToken);
  return user.role === 'admin' ? (user.isInitialSetupComplete && hasTokens) : user.isInitialSetupComplete;
}

export class LoginUseCase {
  constructor(
    private readonly userCredentials: UserCredentialsRepositoryPort,
    private readonly tokenIssuer: TokenIssuerPort,
    private readonly passwordHasher: PasswordHasherPort
  ) {}

  async execute(username: string | undefined, password: string | undefined): Promise<LoginResultOutcome> {
    if (!username || !password) {
      return { kind: 'validation_error', message: 'Username y password son requeridos' };
    }

    const user = await this.userCredentials.findByUsernameOrEmail(username);
    if (!user) {
      return { kind: 'invalid_credentials' };
    }

    if (!user.isActive) {
      return { kind: 'inactive' };
    }

    const isValidPassword = await this.passwordHasher.compare(password, user.password);
    if (!isValidPassword) {
      return { kind: 'invalid_credentials' };
    }

    const now = new Date();
    await this.userCredentials.updateLastLogin(user.id, now);

    const token = this.tokenIssuer.issue(user.id);
    const isSetupComplete = computeIsSetupComplete(user);

    return {
      kind: 'ok',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          lastLogin: now,
          isInitialSetupComplete: isSetupComplete
        },
        requiresInitialSetup: !isSetupComplete
      }
    };
  }
}
