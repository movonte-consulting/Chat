import { InitialSetupRepositoryPort } from '../domain/interfaces/initial-setup-repository.port';

export type GetInitialSetupStatusResult =
  | { kind: 'not_found' }
  | { kind: 'ok'; isInitialSetupComplete: boolean | null; hasJiraToken: boolean; hasOpenaiToken: boolean };

export class GetInitialSetupStatusUseCase {
  constructor(private readonly initialSetup: InitialSetupRepositoryPort) {}

  async execute(userId: number): Promise<GetInitialSetupStatusResult> {
    const status = await this.initialSetup.getStatus(userId);
    if (!status) {
      return { kind: 'not_found' };
    }

    return {
      kind: 'ok',
      isInitialSetupComplete: status.isInitialSetupComplete,
      hasJiraToken: !!status.jiraToken,
      hasOpenaiToken: !!status.openaiToken
    };
  }
}
