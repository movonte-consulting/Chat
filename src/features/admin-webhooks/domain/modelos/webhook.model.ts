export interface WebhookRecord {
  id: number;
  userId: number;
  serviceId: string | null;
  assistantId: string | null;
  token: string | null;
  name: string;
  url: string;
  description: string | null;
  isEnabled: boolean;
  filterEnabled: boolean;
  filterCondition: string | null;
  filterValue: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminWebhookListItem extends WebhookRecord {
  serviceName: string | null;
  userEmail: string | null;
}

export interface CreateWebhookInput {
  userId: number;
  name: string;
  url: string;
  description?: string;
  serviceId?: string;
  assistantId?: string;
  token?: string;
  filterEnabled?: boolean;
  filterCondition?: string;
  filterValue?: string;
}

export interface UpdateWebhookInput {
  name?: string;
  url?: string;
  description?: string;
  serviceId?: string;
  assistantId?: string;
  token?: string;
  isEnabled?: boolean;
  filterEnabled?: boolean;
  filterCondition?: string;
  filterValue?: string;
}
