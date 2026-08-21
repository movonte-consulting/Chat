import { sequelize } from '../../../../config/database';
import { ServiceConfig } from '../../domain/modelos/ticket.model';
import { ServiceConfigProviderPort } from '../../domain/interfaces/service-config-provider.port';

export class ServiceConfigRepository implements ServiceConfigProviderPort {
  async getServiceConfiguration(serviceId: string, userId?: number): Promise<ServiceConfig | null> {
    try {
      let query: string;
      let replacements: any[];

      if (userId) {
        query = `
          SELECT * FROM unified_configurations
          WHERE service_id = ? AND user_id = ? AND is_active = TRUE
          LIMIT 1
        `;
        replacements = [serviceId, userId];
      } else {
        query = `
          SELECT * FROM unified_configurations
          WHERE service_id = ? AND is_active = TRUE
          LIMIT 1
        `;
        replacements = [serviceId];
      }

      const [configurations] = await sequelize.query(query, { replacements });

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
        configuration: typeof config.configuration === 'string'
          ? JSON.parse(config.configuration)
          : config.configuration,
        lastUpdated: config.last_updated
      };
    } catch (error) {
      console.error('Error getting service configuration:', error);
      return null;
    }
  }
}
