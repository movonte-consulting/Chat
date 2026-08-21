import { GlobalJiraPort } from '../domain/interfaces/global-jira.port';

export type SearchTicketsByEmailResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok'; tickets: any[] };

export class SearchTicketsByEmailUseCase {
  constructor(private readonly globalJira: GlobalJiraPort) {}

  async execute(email: unknown): Promise<SearchTicketsByEmailResult> {
    if (!email || typeof email !== 'string') {
      return { kind: 'validation_error', message: 'Missing or invalid email parameter' };
    }

    console.log(`🔍 Searching tickets for email: ${email}`);

    const searchResults = await this.globalJira.searchIssuesByEmail(email);

    return { kind: 'ok', tickets: searchResults.issues || [] };
  }
}
