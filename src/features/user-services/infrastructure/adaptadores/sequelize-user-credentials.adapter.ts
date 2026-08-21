import { User } from '../../../../models';
import { UserCredentialsProviderPort } from '../../domain/interfaces/user-credentials-provider.port';
import { UserOpenAiJiraCredentials } from '../../domain/modelos/user-openai-jira-credentials.model';

export class SequelizeUserCredentialsAdapter implements UserCredentialsProviderPort {
  async getById(userId: number): Promise<UserOpenAiJiraCredentials | null> {
    const user = await User.findByPk(userId);
    if (!user) return null;

    return {
      userId: user.id,
      role: user.role,
      email: user.email,
      openaiToken: user.openaiToken ?? null,
      jiraToken: user.jiraToken ?? null,
      jiraUrl: user.jiraUrl ?? null
    };
  }
}
