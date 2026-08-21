import { User } from '../../../../models';
import { JiraCredentials } from '../../domain/modelos/jira-account.model';
import { UserJiraCredentialsProviderPort } from '../../domain/interfaces/user-jira-credentials-provider.port';

export class UserJiraCredentialsAdapter implements UserJiraCredentialsProviderPort {
  async getOwnCredentials(userId: number): Promise<JiraCredentials | null> {
    const user = await User.findByPk(userId);
    if (!user?.jiraToken || !(user as any).jiraUrl) return null;
    return { email: user.email, token: user.jiraToken, url: (user as any).jiraUrl };
  }
}
