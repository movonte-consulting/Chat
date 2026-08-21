import { RequesterJiraCredentials } from '../modelos/disabled-ticket.model';

export interface RequesterJiraPort {
  getIssueByKey(credentials: RequesterJiraCredentials, issueKey: string): Promise<any | null>;
  addCommentToIssue(credentials: RequesterJiraCredentials, issueKey: string, commentText: string): Promise<void>;
}
