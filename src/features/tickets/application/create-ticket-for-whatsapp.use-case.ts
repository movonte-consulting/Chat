import { ServiceConfigProviderPort } from '../domain/interfaces/service-config-provider.port';
import { JiraAccountRepositoryPort } from '../domain/interfaces/jira-account-repository.port';
import { JiraIssueCreatorPort } from '../domain/interfaces/jira-issue-creator.port';
import { UserJiraCredentialsProviderPort } from '../domain/interfaces/user-jira-credentials-provider.port';
import { CustomerInfo, TicketFormData, buildTicketLabels, formatTicketDescriptionADF, getProjectKeyFromConfig } from '../domain/modelos/ticket.model';

const DEFAULT_JIRA_BASE_URL = 'https://movonte.atlassian.net';

/**
 * Crea un ticket para la integración de WhatsApp (uso interno, sin HTTP).
 * Usado cuando llega un mensaje de WhatsApp y no hay ticket asociado al teléfono.
 */
export class CreateTicketForWhatsAppUseCase {
  constructor(
    private readonly userJiraCredentialsProvider: UserJiraCredentialsProviderPort,
    private readonly jiraAccountRepository: JiraAccountRepositoryPort,
    private readonly serviceConfigProvider: ServiceConfigProviderPort,
    private readonly jiraIssueCreator: JiraIssueCreatorPort
  ) {}

  async execute(userId: number, serviceId: string, customerInfo: CustomerInfo): Promise<{ issueKey: string }> {
    const ownCredentials = await this.userJiraCredentialsProvider.getOwnCredentials(userId);
    if (!ownCredentials) {
      throw new Error(`User ${userId} does not have Jira credentials configured.`);
    }

    const assistantAccount = await this.jiraAccountRepository.getAssistantAccount(userId, serviceId);
    const creds = assistantAccount ?? ownCredentials;

    const serviceConfig = await this.serviceConfigProvider.getServiceConfiguration(serviceId, userId);
    if (!serviceConfig) {
      throw new Error(`Service '${serviceId}' not found or not configured for user ${userId}.`);
    }

    const projectKey = getProjectKeyFromConfig(serviceConfig);
    if (!projectKey) {
      throw new Error(`Service '${serviceId}' does not have projectKey configured.`);
    }

    const formData: TicketFormData = {
      name: customerInfo.name.trim(),
      email: customerInfo.email.trim().toLowerCase(),
      phone: customerInfo.phone?.trim(),
      company: customerInfo.company?.trim(),
      message: customerInfo.message?.trim() || `Contact from WhatsApp - service ${serviceId}`,
      source: 'whatsapp',
      serviceId,
      serviceName: serviceConfig.serviceName,
      projectKey
    };

    const result = await this.jiraIssueCreator.createIssue(
      userId,
      { email: creds.email, token: creds.token, url: creds.url || process.env.JIRA_BASE_URL || DEFAULT_JIRA_BASE_URL },
      {
        projectKey,
        summary: `Service Contact: ${formData.name} - ${formData.company || 'No company'} (${formData.serviceName || formData.serviceId})`,
        description: formatTicketDescriptionADF(formData),
        issueType: 'Task',
        priority: 'Medium',
        labels: buildTicketLabels(formData)
      }
    );

    return { issueKey: result.key };
  }
}
