import { ChatKitJiraPort } from '../domain/interfaces/chatkit-jira.port';

export type ProcessDirectChatResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'failed'; message: string }
  | { kind: 'ok'; sessionId?: string };

export class ProcessDirectChatUseCase {
  constructor(private readonly chatKitJira: ChatKitJiraPort) {}

  async execute(issueKey: string | undefined, message: string | undefined, userInfo: any): Promise<ProcessDirectChatResult> {
    if (!issueKey || !message) {
      return { kind: 'validation_error', message: 'Faltan campos requeridos: issueKey y message' };
    }

    console.log(`💬 Procesando chat directo para ${issueKey}: ${message}`);

    const result = await this.chatKitJira.processJiraComment(issueKey, message, userInfo);

    if (!result.success) {
      return { kind: 'failed', message: result.error || 'Error procesando mensaje' };
    }

    return { kind: 'ok', sessionId: result.sessionId };
  }
}
