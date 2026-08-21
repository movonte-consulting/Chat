import { sequelize } from '../../../../config/database';
import { parseHost } from '../../domain/modelos/hostname';
import { OrganizationLogoProviderPort } from '../../domain/interfaces/organization-logo-provider.port';

export class OrganizationLogoRepositoryAdapter implements OrganizationLogoProviderPort {
  async getLogosByHost(): Promise<Record<string, string>> {
    // organization_logo / jira_url no están mapeadas en el modelo Sequelize de User.
    const [logoRows] = await sequelize.query(
      `SELECT organization_logo AS organizationLogo, jira_url AS jiraUrl FROM users WHERE organization_logo IS NOT NULL AND organization_logo != ''`
    );

    const logosByHost: Record<string, string> = {};
    (logoRows as any[]).forEach((r) => {
      const host = parseHost(r.jiraUrl);
      if (host && !logosByHost[host]) logosByHost[host] = r.organizationLogo;
    });

    return logosByHost;
  }
}
