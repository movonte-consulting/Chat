import { GlobalJiraPort } from '../domain/interfaces/global-jira.port';

export type GetTicketDetailsResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok'; issue: any };

export class GetTicketDetailsUseCase {
  constructor(private readonly globalJira: GlobalJiraPort) {}

  async execute(issueKey: string | undefined): Promise<GetTicketDetailsResult> {
    if (!issueKey) {
      return { kind: 'validation_error', message: 'Missing issueKey parameter' };
    }

    console.log(`📋 Getting details for ticket ${issueKey}`);

    const issue = await this.globalJira.getIssueByKey(issueKey);

    return { kind: 'ok', issue };
  }
}
