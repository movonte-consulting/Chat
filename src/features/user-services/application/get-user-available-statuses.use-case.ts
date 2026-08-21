import { Request, Response } from 'express';
import { UserCredentialsProviderPort } from '../domain/interfaces/user-credentials-provider.port';
import { GlobalJiraStatusesPort } from '../domain/interfaces/global-jira-statuses.port';
import { LegacyStatusesFallbackPort } from '../domain/interfaces/legacy-statuses-fallback.port';

export type GetUserAvailableStatusesResult =
  | { kind: 'delegated' }
  | { kind: 'ok'; data: any[] };

export class GetUserAvailableStatusesUseCase {
  constructor(
    private readonly userCredentials: UserCredentialsProviderPort,
    private readonly globalJiraStatuses: GlobalJiraStatusesPort,
    private readonly legacyStatusesFallback: LegacyStatusesFallbackPort
  ) {}

  async execute(userId: number, req: Request, res: Response): Promise<GetUserAvailableStatusesResult> {
    const credentials = await this.userCredentials.getById(userId);

    if (!credentials || !credentials.jiraToken || !credentials.jiraUrl) {
      await this.legacyStatusesFallback.handle(req, res);
      return { kind: 'delegated' };
    }

    // Nota: aunque el usuario tenga credenciales Jira propias, el original consulta el
    // JiraService global (bug/simplificación preservada — ver plan). El query param
    // `projectKey` tampoco se usa, igual que en el controller legacy.
    const data = await this.globalJiraStatuses.getAllPossibleStatuses();

    return { kind: 'ok', data };
  }
}
