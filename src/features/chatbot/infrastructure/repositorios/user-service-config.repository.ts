import { sequelize } from '../../../../config/database';
import { UserServiceInfo } from '../../domain/modelos/user-service-info.model';
import { UserServiceResolverPort } from '../../domain/interfaces/user-service-resolver.port';

export class UserServiceConfigRepository implements UserServiceResolverPort {
  async findByProjectKey(
    projectKey: string,
    options?: { requireApproved?: boolean }
  ): Promise<UserServiceInfo | null> {
    const requireApproved = options?.requireApproved ?? false;
    const whereClause = requireApproved
      ? `WHERE is_active = TRUE AND (approval_status = 'approved' OR approval_status IS NULL)`
      : `WHERE is_active = true`;

    const [userServices] = await sequelize.query(`SELECT * FROM unified_configurations ${whereClause}`);

    for (const service of userServices as any[]) {
      let config: any = {};
      try {
        config = typeof service.configuration === 'string'
          ? JSON.parse(service.configuration)
          : service.configuration || {};
      } catch {
        config = {};
      }

      if (config?.projectKey === projectKey) {
        console.log(`✅ Ticket proyecto ${projectKey} → servicio de usuario: ${service.service_name} (usuario ${service.user_id})`);
        return {
          userId: service.user_id,
          serviceId: service.service_id,
          serviceName: service.service_name,
          assistantId: service.assistant_id,
          assistantName: service.assistant_name
        };
      }
    }

    console.log(`⚠️ No se encontró servicio de usuario para proyecto ${projectKey}`);
    return null;
  }
}
