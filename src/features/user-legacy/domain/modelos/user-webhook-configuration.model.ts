export interface UserWebhookConfiguration {
  id?: number;
  name: string;
  url: string;
  description?: string;
  isEnabled: boolean;
  filterEnabled: boolean;
  filterCondition?: string;
  filterValue?: string;
  webhookUrl?: string;
  lastTest?: string;
}
