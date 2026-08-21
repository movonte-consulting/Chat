import { sequelize } from '../../../../config/database';
import { ServiceConfigDetails } from '../../domain/modelos/service-config.model';
import { ServiceConfigRepositoryPort } from '../../domain/interfaces/service-config-repository.port';

export class ServiceConfigRepositoryAdapter implements ServiceConfigRepositoryPort {
  async getByServiceId(serviceId: string, userId: number): Promise<ServiceConfigDetails | null> {
    const [configurations] = await sequelize.query(
      `SELECT * FROM unified_configurations WHERE service_id = ? AND user_id = ? LIMIT 1`,
      { replacements: [serviceId, userId] }
    );

    if (!configurations || (configurations as any[]).length === 0) {
      return null;
    }

    const config = (configurations as any[])[0];
    return {
      serviceId: config.service_id,
      serviceName: config.service_name,
      assistantId: config.assistant_id,
      assistantName: config.assistant_name,
      isActive: Boolean(config.is_active),
      lastUpdated: config.last_updated,
      configuration: typeof config.configuration === 'string' ? JSON.parse(config.configuration) : config.configuration
    };
  }

  async update(serviceId: string, userId: number, assistantId: string, assistantName: string): Promise<boolean> {
    const [result] = await sequelize.query(
      `UPDATE unified_configurations
       SET assistant_id = ?, assistant_name = ?, last_updated = NOW()
       WHERE service_id = ? AND user_id = ?`,
      { replacements: [assistantId, assistantName, serviceId, userId] }
    );

    return (result as any).affectedRows > 0;
  }
}
