export interface ServiceConfiguration {
  serviceId: string;
  serviceName: string;
  assistantId: string;
  assistantName: string;
  isActive: boolean;
  lastUpdated: Date;
  approvalStatus: string;
  configuration: any;
}

export interface CreateServiceConfigurationInput {
  serviceId: string;
  serviceName: string;
  assistantId: string;
  assistantName: string;
  isActive: boolean;
  configuration: any;
  approvalStatus: string;
}

export interface UpdateServiceConfigurationInput {
  assistantId: string;
  assistantName: string;
  isActive: boolean;
  configuration: any;
}
