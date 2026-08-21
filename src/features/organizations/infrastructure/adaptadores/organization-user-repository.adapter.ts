import { User } from '../../../../models';
import { OrganizationUserProviderPort } from '../../domain/interfaces/organization-user-provider.port';
import { RawOrgUser } from '../../domain/modelos/organization.model';

export class OrganizationUserRepositoryAdapter implements OrganizationUserProviderPort {
  async listAll(): Promise<RawOrgUser[]> {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'isActive', 'jiraUrl'],
      order: [['username', 'ASC']]
    });

    return users.map((u: any) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      jiraUrl: u.jiraUrl ?? null
    }));
  }
}
