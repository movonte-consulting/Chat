import { InitialSetupRepositoryPort } from '../domain/interfaces/initial-setup-repository.port';

export type CompleteInitialSetupResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok'; organizationLogo: string | undefined };

export class CompleteInitialSetupUseCase {
  constructor(private readonly initialSetup: InitialSetupRepositoryPort) {}

  async execute(
    userId: number,
    jiraToken: string | undefined,
    jiraUrl: string | undefined,
    openaiToken: string | undefined,
    organizationLogo: string | undefined
  ): Promise<CompleteInitialSetupResult> {
    if (!jiraToken || !jiraUrl || !openaiToken) {
      return { kind: 'validation_error', message: 'Jira token, Jira URL y OpenAI token son requeridos' };
    }

    if (jiraToken.length < 10 || openaiToken.length < 10) {
      return { kind: 'validation_error', message: 'Los tokens proporcionados no parecen válidos' };
    }

    await this.initialSetup.complete(userId, { jiraToken, jiraUrl, openaiToken, organizationLogo });

    return { kind: 'ok', organizationLogo };
  }
}
