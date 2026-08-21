export interface JiraCommentSocketPayload {
  message: string;
  author: string;
  timestamp: string;
  source: 'jira-ai' | 'jira-agent';
  issueKey: string;
  isAI: boolean;
}

export interface WebSocketNotifierPort {
  emitComment(issueKey: string, payload: JiraCommentSocketPayload): void;
}
