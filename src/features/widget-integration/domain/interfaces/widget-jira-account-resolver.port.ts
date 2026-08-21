import { JiraCredentials } from '../modelos/jira-credentials.model';

export interface WidgetJiraAccountResolverPort {
  resolve(userId: number, serviceId: string): Promise<JiraCredentials | null>;
}
