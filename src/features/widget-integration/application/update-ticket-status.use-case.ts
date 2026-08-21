import { GlobalJiraPort } from '../domain/interfaces/global-jira.port';

export type UpdateTicketStatusResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok' };

export class UpdateTicketStatusUseCase {
  constructor(private readonly globalJira: GlobalJiraPort) {}

  async execute(issueKey: string | undefined, status: string | undefined): Promise<UpdateTicketStatusResult> {
    if (!issueKey || !status) {
      return { kind: 'validation_error', message: 'Missing required fields: issueKey and status' };
    }

    console.log(`🔄 Updating ticket ${issueKey} status to ${status}`);

    await this.globalJira.updateIssueStatus(issueKey, status);

    return { kind: 'ok' };
  }
}
