import { generateProtectedToken, validateProtectedToken } from '../../../../services/protected_token_service';
import { CorsAutoConfigurationService } from '../servicios/cors-auto-configuration.service';
import { ProtectedTokenIssuerPort } from '../../domain/interfaces/user/protected-token-issuer.port';
import { ProtectedTokenValidatorPort } from '../../domain/interfaces/shared/protected-token-validator.port';
import { CorsAutoConfigurerPort } from '../../domain/interfaces/admin/cors-auto-configurer.port';
import { ProtectedTokenValidation } from '../../domain/modelos/protected-token.model';

/**
 * Envuelve el servicio de tokens protegidos (stateless) y el servicio de
 * auto-configuración de CORS (singleton, en memoria + BD).
 */
export class ServiceValidationServiceAdapter
  implements ProtectedTokenIssuerPort, ProtectedTokenValidatorPort, CorsAutoConfigurerPort {
  private readonly corsAutoConfiguration: CorsAutoConfigurationService;

  constructor() {
    this.corsAutoConfiguration = CorsAutoConfigurationService.getInstance();
  }

  generateProtectedToken(serviceId: string, userId: number, expirationHours: number): string {
    return generateProtectedToken(serviceId, userId, expirationHours);
  }

  validateProtectedToken(protectedToken: string): ProtectedTokenValidation {
    return validateProtectedToken(protectedToken);
  }

  async applyCorsConfiguration(domain: string): Promise<void> {
    await this.corsAutoConfiguration.applyCorsConfiguration(domain);
  }
}
