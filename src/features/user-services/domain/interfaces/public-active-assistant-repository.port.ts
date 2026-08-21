export interface PublicActiveAssistant {
  assistantId: string;
  assistantName: string;
  serviceName: string;
}

export interface PublicActiveAssistantRepositoryPort {
  findActiveByServiceId(serviceId: string): Promise<PublicActiveAssistant | null>;
}
