import { ActiveServiceConfigurationsPort } from '../../domain/interfaces/active-service-configurations.port';
import { ServiceConfigurationSummary } from '../../domain/modelos/service-configuration-summary.model';

export class ActiveServiceConfigurationsRepository implements ActiveServiceConfigurationsPort {
  async listActiveForUser(userId: number): Promise<ServiceConfigurationSummary[]> {
    const { sequelize } = await import('../../../../config/database');
    const [configurations] = await sequelize.query(`
      SELECT * FROM unified_configurations
      WHERE user_id = ? AND is_active = TRUE
      ORDER BY service_name
    `, {
      replacements: [userId]
    });

    return (configurations as any[]).map((config: any) => ({
      serviceId: config.service_id,
      serviceName: config.service_name,
      assistantId: config.assistant_id,
      assistantName: config.assistant_name,
      isActive: Boolean(config.is_active),
      lastUpdated: config.last_updated,
      configuration: typeof config.configuration === 'string'
        ? JSON.parse(config.configuration)
        : config.configuration
    }));
  }
}
