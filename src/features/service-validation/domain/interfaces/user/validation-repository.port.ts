import { ServiceValidationResponse } from '../../modelos/validation-response.model';

export interface ValidationRepositoryPort {
  getUserValidations(userId: number): Promise<ServiceValidationResponse[]>;
}
