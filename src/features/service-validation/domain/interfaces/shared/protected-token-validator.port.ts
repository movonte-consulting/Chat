import { ProtectedTokenValidation } from '../../modelos/protected-token.model';

export interface ProtectedTokenValidatorPort {
  validateProtectedToken(protectedToken: string): ProtectedTokenValidation;
}
