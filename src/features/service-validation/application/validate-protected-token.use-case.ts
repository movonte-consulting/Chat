import { ProtectedTokenValidatorPort } from '../domain/interfaces/shared/protected-token-validator.port';
import { ProtectedTokenValidation } from '../domain/modelos/protected-token.model';

export type ValidateProtectedTokenResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok'; data: ProtectedTokenValidation };

export class ValidateProtectedTokenUseCase {
  constructor(private readonly protectedTokenValidator: ProtectedTokenValidatorPort) {}

  execute(protectedToken: string | undefined): ValidateProtectedTokenResult {
    if (!protectedToken) {
      return { kind: 'validation_error', message: 'Se requiere protectedToken' };
    }

    const data = this.protectedTokenValidator.validateProtectedToken(protectedToken);
    return { kind: 'ok', data };
  }
}
