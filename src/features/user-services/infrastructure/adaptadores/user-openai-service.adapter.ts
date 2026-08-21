import { UserOpenAIService } from '../../../../services/user_openai_service';
import { UserAssistantCatalogPort } from '../../domain/interfaces/user-assistant-catalog.port';
import { UserOpenAiJiraCredentials } from '../../domain/modelos/user-openai-jira-credentials.model';
import { ChatResult } from '../../domain/modelos/chat-result.model';

export class UserOpenAiServiceAdapter implements UserAssistantCatalogPort {
  async listAssistants(credentials: UserOpenAiJiraCredentials): Promise<any[]> {
    const service = new UserOpenAIService(credentials.userId, credentials.openaiToken!);
    return service.listAssistants();
  }

  async processChatForService(
    credentials: UserOpenAiJiraCredentials,
    message: string,
    serviceId: string,
    threadId: string | undefined
  ): Promise<ChatResult> {
    const service = new UserOpenAIService(credentials.userId, credentials.openaiToken!);
    return service.processChatForService(message, serviceId, threadId);
  }
}
