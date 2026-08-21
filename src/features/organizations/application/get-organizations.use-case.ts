import { parseHost } from '../domain/modelos/hostname';
import { Organization } from '../domain/modelos/organization.model';
import { OrganizationUserProviderPort } from '../domain/interfaces/organization-user-provider.port';
import { OrganizationLogoProviderPort } from '../domain/interfaces/organization-logo-provider.port';

/** Agrupa usuarios por organización, inferida del hostname de su jiraUrl. */
export class GetOrganizationsUseCase {
  constructor(
    private readonly userProvider: OrganizationUserProviderPort,
    private readonly logoProvider: OrganizationLogoProviderPort
  ) {}

  async execute(): Promise<Organization[]> {
    const users = await this.userProvider.listAll();
    const logosByHost = await this.logoProvider.getLogosByHost();

    const orgMap: Record<string, Organization> = {};
    for (const u of users) {
      const host = parseHost(u.jiraUrl);
      if (!host) continue;
      if (!orgMap[host]) {
        orgMap[host] = { name: host, logo: logosByHost[host] || null, users: [] };
      }
      orgMap[host].users.push({ id: u.id, username: u.username, email: u.email, role: u.role, isActive: u.isActive });
    }

    return Object.values(orgMap);
  }
}
