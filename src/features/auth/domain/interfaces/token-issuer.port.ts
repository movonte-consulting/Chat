export interface TokenIssuerPort {
  issue(userId: number): string;
}
