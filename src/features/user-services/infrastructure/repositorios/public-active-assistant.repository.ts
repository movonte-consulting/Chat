import { PublicActiveAssistantRepositoryPort, PublicActiveAssistant } from '../../domain/interfaces/public-active-assistant-repository.port';

export class PublicActiveAssistantRepository implements PublicActiveAssistantRepositoryPort {
  async findActiveByServiceId(serviceId: string): Promise<PublicActiveAssistant | null> {
    const { sequelize } = await import('../../../../config/database');
    const [configs] = await sequelize.query(`
      SELECT
        service_id as serviceId,
        service_name as serviceName,
        assistant_id as assistantId,
        assistant_name as assistantName,
        is_active as isActive
      FROM unified_configurations
      WHERE service_id = ? AND is_active = TRUE
      LIMIT 1
    `, {
      replacements: [serviceId]
    });

    const rows = configs as any[];
    if (!rows || rows.length === 0) return null;

    const config = rows[0];
    return {
      assistantId: config.assistantId,
      assistantName: config.assistantName,
      serviceName: config.serviceName
    };
  }
}
