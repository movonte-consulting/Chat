import { ServiceExistenceCheckerPort } from '../../domain/interfaces/service-existence-checker.port';

export class ServiceExistenceRepository implements ServiceExistenceCheckerPort {
  async exists(userId: number, serviceId: string): Promise<boolean> {
    const { sequelize } = await import('../../../../config/database');
    const [services] = await sequelize.query(`
      SELECT id FROM unified_configurations
      WHERE user_id = ? AND CAST(service_id AS CHAR) COLLATE utf8mb4_unicode_ci = CAST(? AS CHAR) COLLATE utf8mb4_unicode_ci
      LIMIT 1
    `, {
      replacements: [userId, serviceId]
    });

    return (services as any[]).length > 0;
  }
}
