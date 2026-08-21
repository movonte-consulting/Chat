import { UserWebhookRepositoryPort } from '../../domain/interfaces/user-webhook-repository.port';
import { WebhookRecord, UserWebhookListItem, CreateWebhookInput, UpdateWebhookInput } from '../../domain/modelos/webhook.model';

function toRecord(webhook: any): WebhookRecord {
  return {
    id: webhook.id,
    userId: webhook.userId,
    serviceId: webhook.serviceId,
    assistantId: webhook.assistantId,
    token: webhook.token,
    name: webhook.name,
    url: webhook.url,
    description: webhook.description,
    isEnabled: webhook.isEnabled,
    filterEnabled: webhook.filterEnabled,
    filterCondition: webhook.filterCondition,
    filterValue: webhook.filterValue,
    createdAt: webhook.createdAt,
    updatedAt: webhook.updatedAt
  };
}

export class UserWebhookRepository implements UserWebhookRepositoryPort {
  async listForUser(userId: number): Promise<UserWebhookListItem[]> {
    const { sequelize } = await import('../../../../config/database');
    const [webhooks] = await sequelize.query(`
      SELECT
        uw.id,
        uw.user_id as userId,
        uw.service_id as serviceId,
        uw.assistant_id as assistantId,
        uw.token,
        uw.name,
        uw.url,
        uw.description,
        uw.is_enabled as isEnabled,
        uw.filter_enabled as filterEnabled,
        uw.filter_condition as filterCondition,
        uw.filter_value as filterValue,
        uw.created_at as createdAt,
        uw.updated_at as updatedAt,
        uc.service_name as serviceName
      FROM user_webhooks uw
      LEFT JOIN unified_configurations uc
        ON CAST(uw.service_id AS CHAR) COLLATE utf8mb4_unicode_ci = CAST(uc.service_id AS CHAR) COLLATE utf8mb4_unicode_ci
        AND uw.user_id = uc.user_id
      WHERE uw.user_id = ?
      ORDER BY uw.is_enabled DESC, uw.created_at DESC
    `, {
      replacements: [userId]
    });

    return webhooks as UserWebhookListItem[];
  }

  async create(userId: number, input: CreateWebhookInput): Promise<WebhookRecord> {
    const { UserWebhook } = await import('../../../../models');
    const savedWebhook = await UserWebhook.create({
      userId,
      serviceId: input.serviceId || undefined,
      assistantId: input.assistantId || undefined,
      token: input.token || undefined,
      name: input.name,
      url: input.url,
      description: input.description || undefined,
      isEnabled: true,
      filterEnabled: input.filterEnabled || false,
      filterCondition: input.filterCondition || undefined,
      filterValue: input.filterValue || undefined
    });

    return toRecord(savedWebhook);
  }

  async findById(id: number): Promise<WebhookRecord | null> {
    const { UserWebhook } = await import('../../../../models');
    const webhook = await UserWebhook.findByPk(id);
    if (!webhook) return null;
    return toRecord(webhook);
  }

  async update(id: number, input: UpdateWebhookInput): Promise<WebhookRecord> {
    const { UserWebhook } = await import('../../../../models');
    const existingWebhook = await UserWebhook.findByPk(id);
    if (!existingWebhook) {
      throw new Error('Webhook no encontrado');
    }

    await existingWebhook.update({
      name: input.name !== undefined ? input.name : existingWebhook.name,
      url: input.url !== undefined ? input.url : existingWebhook.url,
      description: input.description !== undefined ? input.description : existingWebhook.description,
      serviceId: input.serviceId !== undefined ? (input.serviceId || undefined) : existingWebhook.serviceId,
      assistantId: input.assistantId !== undefined ? (input.assistantId || undefined) : existingWebhook.assistantId,
      token: input.token !== undefined ? (input.token || undefined) : existingWebhook.token,
      isEnabled: input.isEnabled !== undefined ? input.isEnabled : existingWebhook.isEnabled,
      filterEnabled: input.filterEnabled !== undefined ? input.filterEnabled : existingWebhook.filterEnabled,
      filterCondition: input.filterCondition !== undefined ? (input.filterCondition || undefined) : existingWebhook.filterCondition,
      filterValue: input.filterValue !== undefined ? (input.filterValue || undefined) : existingWebhook.filterValue
    });

    return toRecord(existingWebhook);
  }

  async deleteForUser(id: number, userId: number): Promise<boolean> {
    const { DatabaseService } = await import('../../../../services/database_service');
    const dbService = DatabaseService.getInstance();
    return dbService.deleteUserWebhook(id, userId);
  }
}
