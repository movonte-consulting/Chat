/** Shape del Map en memoria de ConfigurationService (global, no scoped por usuario, no persiste en DB). */
export interface GlobalServiceConfig {
  serviceId: string;
  serviceName: string;
  assistantId: string;
  assistantName: string;
  isActive: boolean;
  lastUpdated: Date;
}
