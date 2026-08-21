import { JiraAccountRepositoryPort } from '../domain/interfaces/jira-account-repository.port';
import { JiraCredentials } from '../domain/modelos/jira-account.model';

/** Consumida por el feature widget-integration. */
export class GetWidgetJiraAccountUseCase {
  constructor(private readonly jiraAccountRepository: JiraAccountRepositoryPort) {}

  async execute(userId: number, serviceId: string): Promise<JiraCredentials | null> {
    return this.jiraAccountRepository.getWidgetAccount(userId, serviceId);
  }
}
