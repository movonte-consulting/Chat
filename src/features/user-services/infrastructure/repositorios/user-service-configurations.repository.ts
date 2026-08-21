import { UserServiceConfigurationsRepositoryPort } from '../../domain/interfaces/user-service-configurations-repository.port';
import { ServiceConfiguration, CreateServiceConfigurationInput, UpdateServiceConfigurationInput } from '../../domain/modelos/service-configuration.model';

function parseConfiguration(config: any): any {
  if (config.configuration && typeof config.configuration === 'string') {
    try {
      return JSON.parse(config.configuration);
    } catch (e) {
      console.warn('Error parsing configuration JSON:', e);
      return {};
    }
  }
  return config.configuration || {};
}

function toServiceConfiguration(config: any): ServiceConfiguration {
  return {
    serviceId: config.serviceId,
    serviceName: config.serviceName,
    assistantId: config.assistantId,
    assistantName: config.assistantName,
    isActive: Boolean(config.isActive),
    lastUpdated: config.lastUpdated,
    approvalStatus: config.approvalStatus || 'pending',
    configuration: parseConfiguration(config)
  };
}

export class UserServiceConfigurationsRepository implements UserServiceConfigurationsRepositoryPort {
  async listForUser(userId: number): Promise<ServiceConfiguration[]> {
    const { sequelize } = await import('../../../../config/database');
    const [configs] = await sequelize.query(`
      SELECT
        service_id as serviceId,
        service_name as serviceName,
        assistant_id as assistantId,
        assistant_name as assistantName,
        is_active as isActive,
        last_updated as lastUpdated,
        approval_status as approvalStatus,
        configuration
      FROM unified_configurations
      WHERE user_id = ?
      ORDER BY service_name
    `, {
      replacements: [userId]
    });

    return (configs as any[]).map(toServiceConfiguration);
  }

  async findOne(userId: number, serviceId: string): Promise<ServiceConfiguration | null> {
    const { sequelize } = await import('../../../../config/database');
    const [configs] = await sequelize.query(`
      SELECT
        service_id as serviceId,
        service_name as serviceName,
        assistant_id as assistantId,
        assistant_name as assistantName,
        is_active as isActive,
        last_updated as lastUpdated,
        approval_status as approvalStatus,
        configuration
      FROM unified_configurations
      WHERE user_id = ? AND CAST(service_id AS CHAR) COLLATE utf8mb4_unicode_ci = CAST(? AS CHAR) COLLATE utf8mb4_unicode_ci
      LIMIT 1
    `, {
      replacements: [userId, serviceId]
    });

    const rows = configs as any[];
    if (!rows || rows.length === 0) return null;

    return toServiceConfiguration(rows[0]);
  }

  async create(userId: number, input: CreateServiceConfigurationInput): Promise<boolean> {
    try {
      const { sequelize } = await import('../../../../config/database');
      await sequelize.query(`
        INSERT INTO unified_configurations
        (service_id, service_name, user_id, assistant_id, assistant_name, is_active, configuration, approval_status, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, {
        replacements: [
          input.serviceId,
          input.serviceName,
          userId,
          input.assistantId,
          input.assistantName,
          input.isActive,
          JSON.stringify(input.configuration || {}),
          input.approvalStatus || 'pending',
          new Date()
        ]
      });
      return true;
    } catch (error) {
      console.error('Error creating user service configuration:', error);
      return false;
    }
  }

  async update(userId: number, serviceId: string, input: UpdateServiceConfigurationInput): Promise<void> {
    const { sequelize } = await import('../../../../config/database');
    await sequelize.query(`
      UPDATE unified_configurations
      SET
        assistant_id = ?,
        assistant_name = ?,
        is_active = ?,
        configuration = ?,
        last_updated = ?
      WHERE user_id = ? AND CAST(service_id AS CHAR) COLLATE utf8mb4_unicode_ci = CAST(? AS CHAR) COLLATE utf8mb4_unicode_ci
    `, {
      replacements: [
        input.assistantId,
        input.assistantName,
        input.isActive,
        JSON.stringify(input.configuration),
        new Date(),
        userId,
        serviceId
      ]
    });
  }

  async delete(userId: number, serviceId: string): Promise<void> {
    const { sequelize } = await import('../../../../config/database');
    await sequelize.query(`
      DELETE FROM unified_configurations
      WHERE user_id = ? AND service_id = ?
    `, {
      replacements: [userId, serviceId]
    });
  }
}
