import { LegacyUserCredentialsPort } from '../domain/interfaces/legacy-user-credentials.port';
import { PasswordVerifierPort } from '../domain/interfaces/password-verifier.port';
import { TokenIssuerPort } from '../domain/interfaces/token-issuer.port';

export type LoginResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'invalid_credentials' }
  | {
      kind: 'ok';
      data: {
        token: string;
        user: {
          id: number;
          username: string;
          email: string;
          role: string;
          permissions: any;
          isInitialSetupComplete: boolean;
        };
        requiresInitialSetup: boolean;
      };
    };

export class LoginUseCase {
  constructor(
    private readonly userCredentials: LegacyUserCredentialsPort,
    private readonly passwordVerifier: PasswordVerifierPort,
    private readonly tokenIssuer: TokenIssuerPort
  ) {}

  async execute(username: string | undefined, password: string | undefined): Promise<LoginResult> {
    if (!username || !password) {
      return { kind: 'validation_error', message: 'Username y password son requeridos' };
    }

    const user = await this.userCredentials.findByUsername(username);
    if (!user || !user.isActive) {
      return { kind: 'invalid_credentials' };
    }

    const isValidPassword = await this.passwordVerifier.verify(password, user.password);
    if (!isValidPassword) {
      return { kind: 'invalid_credentials' };
    }

    await this.userCredentials.updateLastLogin(user.id, new Date());

    const token = this.tokenIssuer.issue(user.id, user.username);
    const isInitialSetupComplete = user.isInitialSetupComplete ?? false;

    return {
      kind: 'ok',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          isInitialSetupComplete
        },
        requiresInitialSetup: !isInitialSetupComplete
      }
    };
  }
}
