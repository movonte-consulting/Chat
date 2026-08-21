import { ValidationRepositoryPort } from '../../domain/interfaces/user/validation-repository.port';
import { UserLookupPort } from '../../domain/interfaces/user/user-lookup.port';
import { ServiceValidationResponse } from '../../domain/modelos/validation-response.model';

const DOMAIN_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/;

export type CreateValidationRequestResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'user_not_found' }
  | { kind: 'ok'; data: ServiceValidationResponse };

export class CreateValidationRequestUseCase {
  constructor(
    private readonly validationRepository: ValidationRepositoryPort,
    private readonly userLookup: UserLookupPort
  ) {}

  async execute(
    userId: number,
    body: { serviceName?: string; serviceDescription?: string; websiteUrl?: string; requestedDomain?: string }
  ): Promise<CreateValidationRequestResult> {
    const { serviceName, serviceDescription, websiteUrl, requestedDomain } = body;

    if (!serviceName || !websiteUrl || !requestedDomain) {
      return { kind: 'validation_error', message: 'Se requieren: serviceName, websiteUrl y requestedDomain' };
    }

    try {
      new URL(websiteUrl);
    } catch {
      return { kind: 'validation_error', message: 'La URL del sitio web no es válida' };
    }

    if (!DOMAIN_REGEX.test(requestedDomain)) {
      return { kind: 'validation_error', message: 'El dominio solicitado no tiene un formato válido' };
    }

    const userLookup = await this.userLookup.findAdminIdForUser(userId);
    if (!userLookup.exists) {
      return { kind: 'user_not_found' };
    }

    const data = await this.validationRepository.createValidationRequest(userId, {
      serviceName,
      serviceDescription,
      websiteUrl,
      requestedDomain,
      adminId: userLookup.adminId
    });

    return { kind: 'ok', data };
  }
}
