export interface WebhookStats {
  totalReceived: number;
  duplicatesSkipped: number;
  aiCommentsSkipped: number;
  successfulResponses: number;
  errors: number;
  throttledRequests: number;
  lastReset: Date;
}
