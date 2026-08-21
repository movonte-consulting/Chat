import { UserWebhook } from '../../../../models';
import { UserWebhookLookupPort, UserWebhookRecord } from '../../domain/interfaces/user-webhook-lookup.port';

export class UserWebhookLookupAdapter implements UserWebhookLookupPort {
  async findEnabled(userId: number, serviceId: string): Promise<UserWebhookRecord[]> {
    const rows = await UserWebhook.findAll({
      where: { userId, serviceId, isEnabled: true }
    });

    return rows.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      serviceId: r.serviceId,
      assistantId: r.assistantId,
      token: r.token,
      name: r.name,
      url: r.url,
      isEnabled: r.isEnabled,
      filterEnabled: r.filterEnabled,
      filterCondition: r.filterCondition,
      filterValue: r.filterValue
    }));
  }
}
