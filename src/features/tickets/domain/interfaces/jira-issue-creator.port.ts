import { JiraCredentials } from '../modelos/jira-account.model';

export interface CreateIssueParams {
  projectKey: string;
  summary: string;
  description: any;
  issueType: string;
  priority: string;
  labels: string[];
}

export interface CreateIssueResult {
  id: string;
  key: string;
}

export interface JiraIssueCreatorPort {
  /** userId solo se usa para enriquecer logs de error, no para autenticación (esa va en credentials). */
  createIssue(userId: number, credentials: JiraCredentials, params: CreateIssueParams): Promise<CreateIssueResult>;
}
