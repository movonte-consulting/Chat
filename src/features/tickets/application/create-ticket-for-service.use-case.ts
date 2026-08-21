import { ServiceConfigProviderPort } from '../domain/interfaces/service-config-provider.port';
import { JiraAccountRepositoryPort } from '../domain/interfaces/jira-account-repository.port';
import { JiraIssueCreatorPort } from '../domain/interfaces/jira-issue-creator.port';
import { JiraCredentials } from '../domain/modelos/jira-account.model';
import { CustomerInfo, TicketFormData, buildTicketLabels, formatTicketDescriptionADF, getProjectKeyFromConfig } from '../domain/modelos/ticket.model';

export type CreateTicketForServiceResult =
  | {
      ok: true;
      issueKey: string;
      jiraIssueId: string;
      projectKey: string;
      serviceName: string;
      jiraBaseUrl: string;
    }
  | { ok: false; status: 400 | 404; error: string };

const DEFAULT_JIRA_BASE_URL = 'https://movonte.atlassian.net';

/** Crea un ticket para un servicio específico, disparado desde HTTP (POST /api/service/create-ticket). */
export class CreateTicketForServiceUseCase {
  constructor(
    private readonly serviceConfigProvider: ServiceConfigProviderPort,
    private readonly jiraAccountRepository: JiraAccountRepositoryPort,
    private readonly jiraIssueCreator: JiraIssueCreatorPort
  ) {}

  async execute(
    userId: number,
    serviceId: string,
    customerInfo: CustomerInfo,
    ownCredentials: JiraCredentials | null
  ): Promise<CreateTicketForServiceResult> {
    // La cuenta Jira "assistant" del servicio, si existe, sobreescribe las credenciales propias del usuario.
    const assistantAccount = await this.jiraAccountRepository.getAssistantAccount(userId, serviceId);
    const creds = assistantAccount ?? ownCredentials;

    if (!creds?.token || !creds?.email) {
      return {
        ok: false,
        status: 400,
        error: 'Jira credentials not configured. Please configure assistant Jira account in service settings or your profile.'
      };
    }

    const serviceConfig = await this.serviceConfigProvider.getServiceConfiguration(serviceId, userId);
    if (!serviceConfig) {
      return { ok: false, status: 404, error: `Service '${serviceId}' not found or not configured for user ${userId}` };
    }
    if (!serviceConfig.isActive) {
      return { ok: false, status: 400, error: `Service '${serviceId}' is not active` };
    }

    const projectKey = getProjectKeyFromConfig(serviceConfig);
    if (!projectKey) {
      return { ok: false, status: 400, error: `Service '${serviceId}' does not have a configured projectKey` };
    }

    const formData: TicketFormData = {
      name: customerInfo.name.trim(),
      email: customerInfo.email.trim().toLowerCase(),
      phone: customerInfo.phone?.trim(),
      company: customerInfo.company?.trim(),
      message: customerInfo.message?.trim() || `Contact from service ${serviceId}`,
      source: `service-${serviceId}`,
      serviceId,
      serviceName: serviceConfig.serviceName,
      projectKey
    };

    const jiraBaseUrl = creds.url || process.env.JIRA_BASE_URL || DEFAULT_JIRA_BASE_URL;

    const result = await this.jiraIssueCreator.createIssue(
      userId,
      { email: creds.email, token: creds.token, url: jiraBaseUrl },
      {
        projectKey,
        summary: `Service Contact: ${formData.name} - ${formData.company || 'No company'} (${formData.serviceName || formData.serviceId})`,
        description: formatTicketDescriptionADF(formData),
        issueType: 'Task',
        priority: 'Medium',
        labels: buildTicketLabels(formData)
      }
    );

    return {
      ok: true,
      issueKey: result.key,
      jiraIssueId: result.id,
      projectKey,
      serviceName: serviceConfig.serviceName,
      jiraBaseUrl
    };
  }
}
