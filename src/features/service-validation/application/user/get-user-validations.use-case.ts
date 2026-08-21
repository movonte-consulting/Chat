import { ValidationRepositoryPort } from '../../domain/interfaces/user/validation-repository.port';
import { ServiceValidationResponse } from '../../domain/modelos/validation-response.model';

export class GetUserValidationsUseCase {
  constructor(private readonly validationRepository: ValidationRepositoryPort) {}

  async execute(userId: number): Promise<ServiceValidationResponse[]> {
    return this.validationRepository.getUserValidations(userId);
  }
}
