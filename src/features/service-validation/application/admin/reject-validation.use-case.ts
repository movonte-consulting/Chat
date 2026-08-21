import { ValidationDecisionRepositoryPort } from '../../domain/interfaces/admin/validation-decision-repository.port';

export type RejectValidationResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'not_found' }
  | { kind: 'forbidden' }
  | { kind: 'already_decided'; approvalStatus: string }
  | { kind: 'ok'; serviceId: string; serviceName: string; adminNotes: string };

export class RejectValidationUseCase {
  constructor(private readonly validationDecisionRepository: ValidationDecisionRepositoryPort) {}

  async execute(id: string | undefined, adminId: number, adminNotes: string | undefined): Promise<RejectValidationResult> {
    if (!id || isNaN(Number(id))) {
      return { kind: 'validation_error', message: 'ID de servicio inválido' };
    }

    if (!adminNotes || adminNotes.trim().length === 0) {
      return { kind: 'validation_error', message: 'Se requieren notas del administrador para rechazar la solicitud' };
    }

    const service = await this.validationDecisionRepository.findServiceForDecision(Number(id));
    if (!service) {
      return { kind: 'not_found' };
    }

    if (service.userAdminId !== adminId) {
      return { kind: 'forbidden' };
    }

    if (service.approval_status !== 'pending') {
      return { kind: 'already_decided', approvalStatus: service.approval_status };
    }

    let config = service.configuration;
    if (typeof config === 'string') {
      try {
        config = JSON.parse(config);
      } catch (e) {
        config = {};
      }
    }

    await this.validationDecisionRepository.reject(Number(id), {
      ...config,
      adminApproved: false,
      adminRejectedAt: new Date().toISOString(),
      adminNotes
    });

    console.log(`❌ Service rejected: ${service.service_name} for user ${service.user_id}`);

    return {
      kind: 'ok',
      serviceId: service.service_id,
      serviceName: service.service_name,
      adminNotes
    };
  }
}
