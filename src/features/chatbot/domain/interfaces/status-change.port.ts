export interface StatusChangePort {
  checkAndHandle(issueKey: string, newStatus: string): Promise<boolean>;
  isDisabled(issueKey: string): boolean;
  postStatusChangeComment(issueKey: string, commentText: string): Promise<void>;
}
