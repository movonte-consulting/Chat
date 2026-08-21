import { WebhookRecord, UserWebhookListItem, CreateWebhookInput, UpdateWebhookInput } from '../modelos/webhook.model';

/** CRUD completo sobre user_webhooks (distinto del "webhook simple" de UserWebhookConfigRegistry). */
export interface UserWebhookRepositoryPort {
  listForUser(userId: number): Promise<UserWebhookListItem[]>;
  create(userId: number, input: CreateWebhookInput): Promise<WebhookRecord>;
  /** Sin filtro de userId — mismo comportamiento que el controller legacy, ver nota en update-webhook.use-case.ts. */
  findById(id: number): Promise<WebhookRecord | null>;
  update(id: number, input: UpdateWebhookInput): Promise<WebhookRecord>;
  deleteForUser(id: number, userId: number): Promise<boolean>;
}
