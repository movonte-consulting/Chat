import { UserOpenAiJiraCredentials } from '../modelos/user-openai-jira-credentials.model';

export interface UserCredentialsProviderPort {
  getById(userId: number): Promise<UserOpenAiJiraCredentials | null>;
}
