import { PendingValidationsRepositoryPort } from '../../domain/interfaces/admin/pending-validations-repository.port';
import { ValidationRepositoryPort } from '../../domain/interfaces/user/validation-repository.port';

export class GetPendingValidationsUseCase {
  constructor(
    private readonly pendingValidationsRepository: PendingValidationsRepositoryPort,
    private readonly validationRepository: ValidationRepositoryPort
  ) {}

  async execute(adminId: number) {
    const pendingServices = await this.pendingValidationsRepository.listPendingForAdmin(adminId);

    const validations = await Promise.all(
      pendingServices.map(async (service) => {
        let config = service.configuration;
        if (typeof config === 'string') {
          try {
            config = JSON.parse(config);
          } catch (e) {
            config = {};
          }
        }

        // Enriquecimiento legacy preservado: busca en las validaciones "clásicas" del usuario
        // una coincidencia por serviceName, aunque hoy la fuente principal ya es unified_configurations.
        const validationRequests = await this.validationRepository.getUserValidations(service.userId);
        const matchingValidation: any = validationRequests.find((v: any) => v.serviceName === service.serviceName);

        return {
          id: service.id,
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          serviceDescription: matchingValidation?.serviceDescription || config?.serviceDescription || '',
          websiteUrl: config?.websiteUrl || matchingValidation?.websiteUrl || '',
          requestedDomain: config?.requestedDomain || matchingValidation?.requestedDomain || '',
          status: 'pending' as const,
          approvalStatus: service.approvalStatus,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
          user: {
            id: service.userId,
            username: service.username,
            email: service.email
          },
          configuration: config
        };
      })
    );

    return validations;
  }
}
