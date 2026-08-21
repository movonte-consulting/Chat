export interface UserWebhookRecord {
  id: number;
  userId: number;
  serviceId?: string;
  assistantId?: string;
  token?: string;
  name: string;
  url: string;
  isEnabled: boolean;
  filterEnabled: boolean;
  filterCondition?: string;
  filterValue?: string;
}

export interface UserWebhookLookupPort {
  findEnabled(userId: number, serviceId: string): Promise<UserWebhookRecord[]>;
}
