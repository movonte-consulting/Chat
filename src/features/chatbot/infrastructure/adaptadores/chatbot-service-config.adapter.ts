import { ConfigurationService } from '../../../../services/configuration_service';
import { ChatbotServiceConfigPort } from '../../domain/interfaces/chatbot-service-config.port';

export class ChatbotServiceConfigAdapter implements ChatbotServiceConfigPort {
  getActiveAssistantForService(serviceId: string): string | null {
    return ConfigurationService.getInstance().getActiveAssistantForService(serviceId);
  }

  isServiceActive(serviceId: string): boolean {
    return ConfigurationService.getInstance().isServiceActive(serviceId);
  }
}
