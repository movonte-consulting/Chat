import { ChatKitJiraPort } from '../domain/interfaces/chatkit-jira.port';

export type GetSessionStatusResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok'; hasActiveSession: boolean };

export class GetSessionStatusUseCase {
  constructor(private readonly chatKitJira: ChatKitJiraPort) {}

  execute(issueKey: string | undefined): GetSessionStatusResult {
    if (!issueKey) {
      return { kind: 'validation_error', message: 'issueKey es requerido' };
    }

    const hasActiveSession = this.chatKitJira.hasActiveSession(issueKey);
    return { kind: 'ok', hasActiveSession };
  }
}
