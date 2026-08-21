export interface WebhookConfiguration {
  webhookUrl: string;
  isEnabled: boolean;
  lastUpdated: Date;
  filterEnabled: boolean;
  filterCondition: string;
  filterValue: string;
}

export interface ServiceConfiguration {
  serviceId: string;
  serviceName: string;
  assistantId: string;
  assistantName: string;
  isActive: boolean;
  lastUpdated: Date;
}
