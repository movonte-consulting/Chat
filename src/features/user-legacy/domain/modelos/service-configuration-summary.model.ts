export interface ServiceConfigurationSummary {
  serviceId: string;
  serviceName: string;
  assistantId: string;
  assistantName: string;
  isActive: boolean;
  configuration?: any;
  lastUpdated: Date;
}
