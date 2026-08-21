import { WebhookRecord, AdminWebhookListItem, CreateWebhookInput, UpdateWebhookInput } from '../modelos/webhook.model';

export interface WebhookRepositoryPort {
  listAll(): Promise<AdminWebhookListItem[]>;
  create(input: CreateWebhookInput): Promise<WebhookRecord>;
  findById(id: string): Promise<WebhookRecord | null>;
  update(id: string, input: UpdateWebhookInput): Promise<WebhookRecord>;
  delete(id: string): Promise<void>;
}
