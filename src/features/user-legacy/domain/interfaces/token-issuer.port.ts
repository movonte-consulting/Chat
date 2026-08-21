export interface TokenIssuerPort {
  issue(userId: number, username: string): string;
}
