import { RequesterJiraCredentials } from '../modelos/requester-jira-credentials.model';

export interface RequesterJiraProjectsPort {
  listProjects(credentials: RequesterJiraCredentials): Promise<any[]>;
}
