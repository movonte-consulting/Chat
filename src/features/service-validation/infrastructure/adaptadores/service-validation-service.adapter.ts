import { ServiceValidationService } from '../../../../services/service_validation_service';
import { ValidationRepositoryPort } from '../../domain/interfaces/user/validation-repository.port';
import { ProtectedTokenIssuerPort } from '../../domain/interfaces/user/protected-token-issuer.port';
import { ProtectedTokenValidatorPort } from '../../domain/interfaces/shared/protected-token-validator.port';
import { CorsAutoConfigurerPort } from '../../domain/interfaces/admin/cors-auto-configurer.port';
import { ServiceValidationRequest } from '../../domain/modelos/validation-request.model';
import { ServiceValidationResponse } from '../../domain/modelos/validation-response.model';
import { ProtectedTokenValidation } from '../../domain/modelos/protected-token.model';

/**
 * Envuelve el singleton legacy ServiceValidationService. applyCorsConfiguration es un método
 * PRIVADO de esa clase; el controller original ya lo invocaba vía cast a `any` — se preserva
 * ese hack tal cual en lugar de cambiar la visibilidad del método legacy.
 */
export class ServiceValidationServiceAdapter
  implements ValidationRepositoryPort, ProtectedTokenIssuerPort, ProtectedTokenValidatorPort, CorsAutoConfigurerPort {
  private readonly validationService: ServiceValidationService;

  constructor() {
    this.validationService = ServiceValidationService.getInstance();
  }

  async createValidationRequest(userId: number, request: ServiceValidationRequest): Promise<ServiceValidationResponse> {
    return this.validationService.createValidationRequest(userId, request);
  }

  async getUserValidations(userId: number): Promise<ServiceValidationResponse[]> {
    return this.validationService.getUserValidations(userId);
  }

  generateProtectedToken(serviceId: string, userId: number, expirationHours: number): string {
    return this.validationService.generateProtectedToken(serviceId, userId, expirationHours);
  }

  validateProtectedToken(protectedToken: string): ProtectedTokenValidation {
    return this.validationService.validateProtectedToken(protectedToken);
  }

  async applyCorsConfiguration(domain: string): Promise<void> {
    const serviceValidationService = this.validationService as any;
    if (serviceValidationService.applyCorsConfiguration) {
      await serviceValidationService.applyCorsConfiguration(domain);
    }
  }
}
