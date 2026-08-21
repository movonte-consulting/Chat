export interface DisabledTicket {
  issueKey: string;
  reason: string;
  disabledAt: Date;
  disabledBy: string;
}

export interface RequesterJiraCredentials {
  userId: number;
  username: string;
  email: string;
  jiraToken: string | null;
  jiraUrl: string | null;
}
