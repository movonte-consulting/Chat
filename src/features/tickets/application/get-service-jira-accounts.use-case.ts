import { JiraAccountRepositoryPort } from '../domain/interfaces/jira-account-repository.port';
import { JiraAccountRecord } from '../domain/modelos/jira-account.model';

export class GetServiceJiraAccountsUseCase {
  constructor(private readonly jiraAccountRepository: JiraAccountRepositoryPort) {}

  async execute(userId: number, serviceId: string): Promise<JiraAccountRecord | null> {
    return this.jiraAccountRepository.findByUserAndService(userId, serviceId);
  }
}
