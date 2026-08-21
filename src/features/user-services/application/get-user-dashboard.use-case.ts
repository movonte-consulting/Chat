import { UserCredentialsProviderPort } from '../domain/interfaces/user-credentials-provider.port';
import { UserAssistantCatalogPort } from '../domain/interfaces/user-assistant-catalog.port';
import { UserJiraProjectsPort } from '../domain/interfaces/user-jira-projects.port';
import { UserServiceConfigurationsRepositoryPort } from '../domain/interfaces/user-service-configurations-repository.port';

export type GetUserDashboardResult =
  | { kind: 'missing_tokens' }
  | { kind: 'ok'; data: { assistants: any[]; projects: any[]; serviceConfigurations: any[]; totalAssistants: number; totalProjects: number; totalServices: number } };

export class GetUserDashboardUseCase {
  constructor(
    private readonly userCredentials: UserCredentialsProviderPort,
    private readonly userAssistantCatalog: UserAssistantCatalogPort,
    private readonly userJiraProjects: UserJiraProjectsPort,
    private readonly userServiceConfigurations: UserServiceConfigurationsRepositoryPort
  ) {}

  async execute(userId: number): Promise<GetUserDashboardResult> {
    const credentials = await this.userCredentials.getById(userId);
    if (!credentials || !credentials.openaiToken || !credentials.jiraToken) {
      return { kind: 'missing_tokens' };
    }

    const assistants = await this.userAssistantCatalog.listAssistants(credentials);
    const projects = await this.userJiraProjects.listProjects(credentials);
    const serviceConfigs = await this.userServiceConfigurations.listForUser(userId);

    return {
      kind: 'ok',
      data: {
        assistants,
        projects,
        serviceConfigurations: serviceConfigs,
        totalAssistants: assistants.length,
        totalProjects: projects.length,
        totalServices: serviceConfigs.length
      }
    };
  }
}
