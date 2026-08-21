import { JiraAccountRepositoryPort } from '../domain/interfaces/jira-account-repository.port';

export class DeleteServiceJiraAccountsUseCase {
  constructor(private readonly jiraAccountRepository: JiraAccountRepositoryPort) {}

  async execute(userId: number, serviceId: string): Promise<void> {
    await this.jiraAccountRepository.delete(userId, serviceId);
  }
}
