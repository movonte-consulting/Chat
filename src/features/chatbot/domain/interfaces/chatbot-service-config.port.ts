export interface ChatbotServiceConfigPort {
  getActiveAssistantForService(serviceId: string): string | null;
  isServiceActive(serviceId: string): boolean;
}
