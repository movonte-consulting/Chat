import { ChatKitJiraPort } from '../domain/interfaces/chatkit-jira.port';

export type SendWidgetMessageResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'failed'; message: string }
  | { kind: 'ok'; sessionId?: string };

export class SendWidgetMessageUseCase {
  constructor(private readonly chatKitJira: ChatKitJiraPort) {}

  async execute(issueKey: string | undefined, message: string | undefined, customerInfo: any): Promise<SendWidgetMessageResult> {
    if (!issueKey || !message || !customerInfo) {
      return { kind: 'validation_error', message: 'Faltan campos requeridos: issueKey, message, y customerInfo' };
    }

    console.log(`📤 Widget enviando mensaje a ticket ${issueKey}: ${message}`);

    const result = await this.chatKitJira.processWidgetMessage(issueKey, message, customerInfo);

    if (!result.success) {
      return { kind: 'failed', message: result.error || 'Error procesando mensaje' };
    }

    return { kind: 'ok', sessionId: result.sessionId };
  }
}
