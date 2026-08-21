import { UserOpenAiJiraCredentials } from '../modelos/user-openai-jira-credentials.model';
import { ChatResult } from '../modelos/chat-result.model';

export interface UserAssistantCatalogPort {
  listAssistants(credentials: UserOpenAiJiraCredentials): Promise<any[]>;
  processChatForService(
    credentials: UserOpenAiJiraCredentials,
    message: string,
    serviceId: string,
    threadId: string | undefined
  ): Promise<ChatResult>;
}
