import { ServiceAccessCheckerPort } from '../../domain/interfaces/user/service-access-checker.port';
import { ProtectedTokenIssuerPort } from '../../domain/interfaces/user/protected-token-issuer.port';

const MIN_HOURS = 1;
const MAX_HOURS = 24 * 30;
const DEFAULT_HOURS = 24;

export type GenerateProtectedTokenResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'no_access' }
  | { kind: 'not_active' }
  | { kind: 'not_approved'; approvalStatus: string }
  | { kind: 'ok'; protectedToken: string; expirationHours: number };

export class GenerateProtectedTokenUseCase {
  constructor(
    private readonly serviceAccessChecker: ServiceAccessCheckerPort,
    private readonly protectedTokenIssuer: ProtectedTokenIssuerPort
  ) {}

  async execute(userId: number, serviceId: string | undefined, expirationHours: unknown): Promise<GenerateProtectedTokenResult> {
    if (!serviceId) {
      return { kind: 'validation_error', message: 'Se requiere serviceId' };
    }

    let validExpirationHours = DEFAULT_HOURS;
    if (expirationHours !== undefined && expirationHours !== null && typeof expirationHours === 'number') {
      if (expirationHours < MIN_HOURS || expirationHours > MAX_HOURS) {
        return {
          kind: 'validation_error',
          message: `El tiempo de expiración debe estar entre ${MIN_HOURS} y ${MAX_HOURS} horas`
        };
      }
      validExpirationHours = expirationHours;
    }

    const service = await this.serviceAccessChecker.getServiceForUser(userId, serviceId);
    if (!service) {
      return { kind: 'no_access' };
    }

    if (!service.isActive) {
      return { kind: 'not_active' };
    }

    if (service.approvalStatus !== 'approved') {
      return { kind: 'not_approved', approvalStatus: service.approvalStatus };
    }

    const protectedToken = this.protectedTokenIssuer.generateProtectedToken(serviceId, userId, validExpirationHours);

    return { kind: 'ok', protectedToken, expirationHours: validExpirationHours };
  }
}
