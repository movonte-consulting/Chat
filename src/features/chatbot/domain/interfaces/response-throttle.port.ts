export interface ThrottleCheck {
  throttled: boolean;
  remainingSeconds?: number;
  /** Timestamp capturado en el momento del check; debe reusarse en markResponded (igual que el original). */
  checkedAt: number;
}

export interface ResponseThrottlePort {
  check(issueKey: string): ThrottleCheck;
  markResponded(issueKey: string, checkedAt: number): void;
}
