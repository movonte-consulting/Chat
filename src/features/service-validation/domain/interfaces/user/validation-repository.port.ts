import { ServiceValidationRequest } from '../../modelos/validation-request.model';
import { ServiceValidationResponse } from '../../modelos/validation-response.model';

export interface ValidationRepositoryPort {
  createValidationRequest(userId: number, request: ServiceValidationRequest): Promise<ServiceValidationResponse>;
  getUserValidations(userId: number): Promise<ServiceValidationResponse[]>;
}
