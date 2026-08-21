export interface JiraCommenterPort {
  /** Resolves Jira credentials for the (userId, serviceId) pair and adds the comment. */
  addComment(userId: number, serviceId: string, issueKey: string, commentText: string): Promise<void>;
}
