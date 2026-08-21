export interface UserCredentialsProviderPort {
  getOpenAIToken(userId: number): Promise<string | null>;
}
