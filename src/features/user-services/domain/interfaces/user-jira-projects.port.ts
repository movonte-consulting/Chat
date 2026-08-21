import { UserOpenAiJiraCredentials } from '../modelos/user-openai-jira-credentials.model';

export interface UserJiraProjectsPort {
  listProjects(credentials: UserOpenAiJiraCredentials): Promise<any[]>;
}
