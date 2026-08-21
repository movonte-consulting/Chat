import { UserCredentialsRepositoryPort } from '../domain/interfaces/user-credentials-repository.port';

export type GetProfileResult =
  | { kind: 'not_found' }
  | { kind: 'ok'; isInitialSetupComplete: boolean };

export class GetProfileUseCase {
  constructor(private readonly userCredentials: UserCredentialsRepositoryPort) {}

  async execute(userId: number): Promise<GetProfileResult> {
    const fullUser = await this.userCredentials.findById(userId);
    if (!fullUser) {
      return { kind: 'not_found' };
    }

    const hasTokens = !!(fullUser.jiraToken && fullUser.openaiToken);
    const isSetupComplete = fullUser.role === 'admin'
      ? (fullUser.isInitialSetupComplete && hasTokens)
      : fullUser.isInitialSetupComplete;

    return { kind: 'ok', isInitialSetupComplete: isSetupComplete };
  }
}
