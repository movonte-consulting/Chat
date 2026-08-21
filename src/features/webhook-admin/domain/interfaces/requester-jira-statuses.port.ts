import { RequesterJiraCredentials } from '../modelos/requester-jira-credentials.model';

export interface RequesterJiraStatusesPort {
  getAllPossibleStatuses(credentials: RequesterJiraCredentials): Promise<any[]>;
}
