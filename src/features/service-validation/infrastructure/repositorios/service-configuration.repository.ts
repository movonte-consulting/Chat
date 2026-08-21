import { ServiceAccessCheckerPort } from '../../domain/interfaces/user/service-access-checker.port';
import { ValidationRepositoryPort } from '../../domain/interfaces/user/validation-repository.port';
import { PendingValidationsRepositoryPort } from '../../domain/interfaces/admin/pending-validations-repository.port';
import { ValidationDecisionRepositoryPort } from '../../domain/interfaces/admin/validation-decision-repository.port';
import { ServiceConfigurationRow, PendingValidationRow, ValidationDecisionRow } from '../../domain/modelos/service-configuration-row.model';
import { ServiceValidationResponse } from '../../domain/modelos/validation-response.model';

export class ServiceConfigurationRepository
  implements ServiceAccessCheckerPort, ValidationRepositoryPort, PendingValidationsRepositoryPort, ValidationDecisionRepositoryPort {
  async getServiceForUser(userId: number, serviceId: string): Promise<ServiceConfigurationRow | null> {
    const { sequelize } = await import('../../../../config/database');
    const [configurations] = await sequelize.query(`
      SELECT * FROM unified_configurations
      WHERE user_id = ? AND CAST(service_id AS CHAR) COLLATE utf8mb4_unicode_ci = CAST(? AS CHAR) COLLATE utf8mb4_unicode_ci
      LIMIT 1
    `, {
      replacements: [userId, serviceId]
    });

    const rows = configurations as any[];
    if (!rows || rows.length === 0) return null;

    const config = rows[0];
    return {
      id: config.id,
      serviceId: config.service_id,
      serviceName: config.service_name,
      userId: config.user_id,
      assistantId: config.assistant_id,
      assistantName: config.assistant_name,
      isActive: Boolean(config.is_active),
      approvalStatus: config.approval_status,
      configuration: typeof config.configuration === 'string' ? JSON.parse(config.configuration) : config.configuration,
      createdAt: config.created_at,
      updatedAt: config.updated_at
    };
  }

  async getUserValidations(userId: number): Promise<ServiceValidationResponse[]> {
    const { sequelize } = await import('../../../../config/database');
    const [rows] = await sequelize.query(`
      SELECT * FROM unified_configurations
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, {
      replacements: [userId]
    });

    return (rows as any[]).map(row => {
      const config = typeof row.configuration === 'string' ? JSON.parse(row.configuration) : row.configuration || {};

      return {
        id: row.id,
        serviceName: row.service_name,
        websiteUrl: config.websiteUrl,
        requestedDomain: config.requestedDomain,
        status: row.approval_status,
        adminNotes: config.adminNotes,
        validatedAt: config.adminApprovedAt || config.adminRejectedAt,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      } as ServiceValidationResponse;
    });
  }

  async listPendingForAdmin(adminId: number): Promise<PendingValidationRow[]> {
    const { sequelize } = await import('../../../../config/database');
    const [pendingServices] = await sequelize.query(`
      SELECT
        uc.id,
        uc.service_id as serviceId,
        uc.service_name as serviceName,
        uc.user_id as userId,
        uc.assistant_id as assistantId,
        uc.assistant_name as assistantName,
        uc.is_active as isActive,
        uc.approval_status as approvalStatus,
        uc.configuration,
        uc.created_at as createdAt,
        uc.updated_at as updatedAt,
        u.username,
        u.email,
        u.admin_id as adminId
      FROM unified_configurations uc
      INNER JOIN users u ON uc.user_id = u.id
      WHERE uc.approval_status = 'pending'
        AND u.admin_id = ?
      ORDER BY uc.created_at ASC
    `, {
      replacements: [adminId]
    });

    return pendingServices as PendingValidationRow[];
  }

  async findServiceForDecision(id: number): Promise<ValidationDecisionRow | null> {
    const { sequelize } = await import('../../../../config/database');
    const [services] = await sequelize.query(`
      SELECT uc.*, u.admin_id as userAdminId
      FROM unified_configurations uc
      INNER JOIN users u ON uc.user_id = u.id
      WHERE uc.id = ?
    `, {
      replacements: [id]
    });

    const rows = services as any[];
    if (!rows || rows.length === 0) return null;
    return rows[0] as ValidationDecisionRow;
  }

  async approve(id: number, configuration: any): Promise<void> {
    const { sequelize } = await import('../../../../config/database');
    await sequelize.query(`
      UPDATE unified_configurations
      SET
        approval_status = 'approved',
        is_active = true,
        configuration = ?,
        last_updated = NOW()
      WHERE id = ?
    `, {
      replacements: [JSON.stringify(configuration), id]
    });
  }

  async reject(id: number, configuration: any): Promise<void> {
    const { sequelize } = await import('../../../../config/database');
    await sequelize.query(`
      UPDATE unified_configurations
      SET
        approval_status = 'rejected',
        is_active = false,
        configuration = ?,
        last_updated = NOW()
      WHERE id = ?
    `, {
      replacements: [JSON.stringify(configuration), id]
    });
  }
}
