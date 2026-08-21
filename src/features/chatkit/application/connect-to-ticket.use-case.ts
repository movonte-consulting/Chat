import { ChatKitJiraPort } from '../domain/interfaces/chatkit-jira.port';

export type ConnectToTicketResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok'; sessionId: string };

export class ConnectToTicketUseCase {
  constructor(private readonly chatKitJira: ChatKitJiraPort) {}

  async execute(issueKey: string | undefined): Promise<ConnectToTicketResult> {
    if (!issueKey) {
      return { kind: 'validation_error', message: 'issueKey es requerido' };
    }

    console.log(`🔗 Widget conectándose al ticket ${issueKey}`);

    const session = await this.chatKitJira.createSessionForTicket(issueKey);

    return { kind: 'ok', sessionId: session.id };
  }
}
