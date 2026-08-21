/**
 * Loads active services for the user from unified_configurations.
 * Keywords come from configuration.whatsappKeywords (array or comma-separated string).
 */

import { sequelize } from '../../../../config/database';
import { RoutableService } from '../../domain/modelos/intent-router.model';
import { RoutableServiceProviderPort } from '../../domain/interfaces/routable-service-provider.port';

export class RoutableServiceProviderAdapter implements RoutableServiceProviderPort {
  async getRoutableServices(userId: number): Promise<RoutableService[]> {
    const [rows] = await sequelize.query(
      `SELECT service_id, service_name, configuration
       FROM unified_configurations
       WHERE user_id = :userId AND is_active = TRUE
       ORDER BY service_name`,
      { replacements: { userId } }
    ) as [any[], unknown];

    const result: RoutableService[] = [];
    for (const row of rows || []) {
      const config =
        typeof row.configuration === 'string'
          ? JSON.parse(row.configuration || '{}')
          : row.configuration || {};
      let keywords: string[] = [];
      if (Array.isArray(config.whatsappKeywords)) {
        keywords = config.whatsappKeywords.map((k: string) => String(k).trim().toLowerCase()).filter(Boolean);
      } else if (typeof config.whatsappKeywords === 'string') {
        keywords = config.whatsappKeywords
          .split(',')
          .map((k: string) => k.trim().toLowerCase())
          .filter(Boolean);
      }
      result.push({
        serviceId: String(row.service_id),
        serviceName: row.service_name || String(row.service_id),
        keywords
      });
    }
    return result;
  }
}
