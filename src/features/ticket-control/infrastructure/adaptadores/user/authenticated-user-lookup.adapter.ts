import { User } from '../../../../../models';
import { RequesterJiraCredentials } from '../../../domain/modelos/disabled-ticket.model';
import { AuthenticatedUserLookupPort } from '../../../domain/interfaces/user/authenticated-user-lookup.port';

export class AuthenticatedUserLookupAdapter implements AuthenticatedUserLookupPort {
  async findById(userId: number): Promise<RequesterJiraCredentials | null> {
    const user = await User.findByPk(userId);
    if (!user) return null;
    return {
      userId: user.id,
      username: user.username,
      email: user.email,
      jiraToken: user.jiraToken ?? null,
      jiraUrl: (user as any).jiraUrl ?? null
    };
  }
}
