import { ServiceConfigRegistry } from '../../../../services/service_config_registry';
import { ChatbotServiceConfigPort } from '../../domain/interfaces/chatbot-service-config.port';

export class ChatbotServiceConfigAdapter implements ChatbotServiceConfigPort {
  getActiveAssistantForService(serviceId: string): string | null {
    return ServiceConfigRegistry.getInstance().getActiveAssistantForService(serviceId);
  }

  isServiceActive(serviceId: string): boolean {
    return ServiceConfigRegistry.getInstance().isServiceActive(serviceId);
  }
}
