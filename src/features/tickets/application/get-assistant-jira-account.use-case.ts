import { JiraAccountRepositoryPort } from '../domain/interfaces/jira-account-repository.port';
import { JiraCredentials } from '../domain/modelos/jira-account.model';

/** Consumida por el feature chatbot (comentar en Jira) y por el feature whatsapp. */
export class GetAssistantJiraAccountUseCase {
  constructor(private readonly jiraAccountRepository: JiraAccountRepositoryPort) {}

  async execute(userId: number, serviceId: string): Promise<JiraCredentials | null> {
    return this.jiraAccountRepository.getAssistantAccount(userId, serviceId);
  }
}
