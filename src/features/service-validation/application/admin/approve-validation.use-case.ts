import { ValidationDecisionRepositoryPort } from '../../domain/interfaces/admin/validation-decision-repository.port';
import { CorsAutoConfigurerPort } from '../../domain/interfaces/admin/cors-auto-configurer.port';

export type ApproveValidationResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'not_found' }
  | { kind: 'forbidden' }
  | { kind: 'already_decided'; approvalStatus: string }
  | { kind: 'ok'; serviceId: string; serviceName: string; requestedDomain?: string; adminNotes: string };

export class ApproveValidationUseCase {
  constructor(
    private readonly validationDecisionRepository: ValidationDecisionRepositoryPort,
    private readonly corsAutoConfigurer: CorsAutoConfigurerPort
  ) {}

  async execute(id: string | undefined, adminId: number, adminNotes: string | undefined): Promise<ApproveValidationResult> {
    if (!id || isNaN(Number(id))) {
      return { kind: 'validation_error', message: 'ID de servicio inválido' };
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

    const resolvedNotes = adminNotes || 'Aprobado por administrador';

    await this.validationDecisionRepository.approve(Number(id), {
      ...config,
      adminApproved: true,
      adminApprovedAt: new Date().toISOString(),
      adminNotes: resolvedNotes
    });

    const requestedDomain = config?.requestedDomain;
    if (requestedDomain) {
      try {
        await this.corsAutoConfigurer.applyCorsConfiguration(requestedDomain);
      } catch (corsError) {
        console.warn('⚠️ Error applying CORS configuration (non-critical):', corsError);
      }
    }

    console.log(`✅ Service approved: ${service.service_name} for user ${service.user_id}`);

    return {
      kind: 'ok',
      serviceId: service.service_id,
      serviceName: service.service_name,
      requestedDomain,
      adminNotes: resolvedNotes
    };
  }
}
