import { AssistantCatalogPort } from '../domain/interfaces/assistant-catalog.port';
import { RequesterJiraProjectsPort } from '../domain/interfaces/requester-jira-projects.port';
import { ActiveProjectRegistryPort } from '../domain/interfaces/active-project-registry.port';
import { ActiveServiceConfigurationsPort } from '../domain/interfaces/active-service-configurations.port';
import { RequesterJiraCredentials } from '../domain/modelos/requester-jira-credentials.model';
import { AssistantWithStatus } from '../domain/modelos/assistant-with-status.model';
import { ServiceConfigurationSummary } from '../domain/modelos/service-configuration-summary.model';

export interface DashboardData {
  assistants: AssistantWithStatus[];
  projects: any[];
  serviceConfigurations: ServiceConfigurationSummary[];
  activeProject: string;
  activeAssistant: string;
  totalAssistants: number;
  totalProjects: number;
  totalServices: number;
}

export type GetDashboardResult =
  | { kind: 'no_credentials' }
  | { kind: 'ok'; data: DashboardData };

export class GetDashboardUseCase {
  constructor(
    private readonly assistantCatalog: AssistantCatalogPort,
    private readonly requesterJiraProjects: RequesterJiraProjectsPort,
    private readonly activeProjectRegistry: ActiveProjectRegistryPort,
    private readonly activeServiceConfigurations: ActiveServiceConfigurationsPort
  ) {}

  async execute(credentials: RequesterJiraCredentials | null, userId: number): Promise<GetDashboardResult> {
    const assistants = await this.assistantCatalog.listAssistants();

    if (!credentials || !credentials.jiraToken || !credentials.jiraUrl) {
      return { kind: 'no_credentials' };
    }

    const projects = await this.requesterJiraProjects.listProjects(credentials);
    const serviceConfigs = await this.activeServiceConfigurations.listActiveForUser(userId);
    const activeProject = this.activeProjectRegistry.get();

    const landingPageService = serviceConfigs.find(config => config.serviceId === 'landing-page');
    const globalAssistantId = landingPageService?.assistantId || '';

    const activeAssistantIds = new Set<string>();
    serviceConfigs.forEach(config => {
      if (config.isActive && config.assistantId) {
        activeAssistantIds.add(config.assistantId);
      }
    });

    const assistantsWithStatus: AssistantWithStatus[] = assistants.map(assistant => ({
      ...assistant,
      isActive: activeAssistantIds.has(assistant.id),
      isGlobalActive: assistant.id === globalAssistantId
    }));

    return {
      kind: 'ok',
      data: {
        assistants: assistantsWithStatus,
        projects,
        serviceConfigurations: serviceConfigs,
        activeProject,
        activeAssistant: globalAssistantId,
        totalAssistants: assistants.length,
        totalProjects: projects.length,
        totalServices: serviceConfigs.length
      }
    };
  }
}
