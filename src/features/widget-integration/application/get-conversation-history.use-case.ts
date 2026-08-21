import { GlobalJiraPort } from '../domain/interfaces/global-jira.port';

export type GetConversationHistoryResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok'; data: any[] };

export class GetConversationHistoryUseCase {
  constructor(private readonly globalJira: GlobalJiraPort) {}

  async execute(issueKey: string | undefined): Promise<GetConversationHistoryResult> {
    if (!issueKey) {
      return { kind: 'validation_error', message: 'Missing issueKey parameter' };
    }

    console.log(`📋 Getting conversation history for ticket ${issueKey}`);

    const data = await this.globalJira.getConversationHistory(issueKey);

    return { kind: 'ok', data };
  }
}
