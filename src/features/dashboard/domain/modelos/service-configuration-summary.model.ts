export interface ServiceConfigurationSummary {
  serviceId: string;
  serviceName: string;
  assistantId: string;
  assistantName: string;
  isActive: boolean;
  lastUpdated: Date | string;
  configuration: any;
}
