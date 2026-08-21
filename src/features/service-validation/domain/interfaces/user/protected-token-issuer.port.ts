export interface ProtectedTokenIssuerPort {
  generateProtectedToken(serviceId: string, userId: number, expirationHours: number): string;
}
