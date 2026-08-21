import { UserCredentialsProviderPort } from '../domain/interfaces/user-credentials-provider.port';
import { UserAssistantCatalogPort } from '../domain/interfaces/user-assistant-catalog.port';
import { ChatResult } from '../domain/modelos/chat-result.model';

export type ChatWithUserServiceResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'missing_openai_token' }
  | { kind: 'ok'; data: ChatResult }
  | { kind: 'failed'; error: string | undefined };

export class ChatWithUserServiceUseCase {
  constructor(
    private readonly userCredentials: UserCredentialsProviderPort,
    private readonly userAssistantCatalog: UserAssistantCatalogPort
  ) {}

  async execute(userId: number, serviceId: string, message: string | undefined, threadId: string | undefined): Promise<ChatWithUserServiceResult> {
    if (!message) {
      return { kind: 'validation_error', message: 'Se requiere el mensaje' };
    }

    const credentials = await this.userCredentials.getById(userId);
    if (!credentials || !credentials.openaiToken) {
      return { kind: 'missing_openai_token' };
    }

    const result = await this.userAssistantCatalog.processChatForService(credentials, message, serviceId, threadId);

    if (!result.success) {
      return { kind: 'failed', error: result.error };
    }

    return { kind: 'ok', data: result };
  }
}
