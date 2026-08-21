import { RequesterJiraCredentials } from '../modelos/requester-jira-credentials.model';

export interface RequesterJiraProjectsPort {
  listProjects(credentials: RequesterJiraCredentials): Promise<any[]>;
  getProjectByKey(credentials: RequesterJiraCredentials, projectKey: string): Promise<any>;
  testConnection(credentials: RequesterJiraCredentials): Promise<boolean>;
}
