/** Shape de una fila de unified_configurations, scoped por user_id. */
export interface ServiceConfigDetails {
  serviceId: string;
  serviceName: string;
  assistantId: string;
  assistantName: string;
  isActive: boolean;
  lastUpdated: Date | string | null;
  configuration: Record<string, any>;
}
