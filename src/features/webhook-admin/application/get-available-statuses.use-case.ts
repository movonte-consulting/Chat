import { RequesterJiraStatusesPort } from '../domain/interfaces/requester-jira-statuses.port';
import { RequesterJiraCredentials } from '../domain/modelos/requester-jira-credentials.model';

export type GetAvailableStatusesResult =
  | { kind: 'no_credentials' }
  | { kind: 'ok'; data: any[] };

export class GetAvailableStatusesUseCase {
  constructor(private readonly requesterJiraStatuses: RequesterJiraStatusesPort) {}

  async execute(credentials: RequesterJiraCredentials | null): Promise<GetAvailableStatusesResult> {
    console.log('🔍 getAvailableStatuses called');

    if (!credentials || !credentials.jiraToken || !credentials.jiraUrl) {
      return { kind: 'no_credentials' };
    }

    const statuses = await this.requesterJiraStatuses.getAllPossibleStatuses(credentials);
    console.log('📋 Available statuses:', statuses);

    return { kind: 'ok', data: statuses };
  }
}
