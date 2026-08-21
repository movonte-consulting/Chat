export interface CommentDedupPort {
  isProcessed(commentId: string): boolean;
  markProcessed(commentId: string): void;
}
