import { JiraAccountRepositoryPort } from '../domain/interfaces/jira-account-repository.port';
import { JiraAccountRecord, UpsertJiraAccountsInput } from '../domain/modelos/jira-account.model';

export type UpsertServiceJiraAccountsResult =
  | { ok: true; data: JiraAccountRecord }
  | { ok: false; status: 404; error: string };

export class UpsertServiceJiraAccountsUseCase {
  constructor(private readonly jiraAccountRepository: JiraAccountRepositoryPort) {}

  async execute(userId: number, serviceId: string, input: UpsertJiraAccountsInput): Promise<UpsertServiceJiraAccountsResult> {
    const hasAccess = await this.jiraAccountRepository.verifyServiceAccess(userId, serviceId);
    if (!hasAccess) {
      return { ok: false, status: 404, error: 'Servicio no encontrado o sin acceso' };
    }

    const data = await this.jiraAccountRepository.upsert(userId, serviceId, input);
    return { ok: true, data };
  }
}
