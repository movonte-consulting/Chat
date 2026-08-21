import { JiraContactIssueCreatorPort } from '../domain/interfaces/jira-contact-issue-creator.port';
import { JiraIssueSummary } from '../domain/modelos/contact-form-data.model';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CreateTicketFromLandingResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'error'; message: string }
  | { kind: 'ok'; jiraIssue: JiraIssueSummary };

export class CreateTicketFromLandingUseCase {
  constructor(private readonly jiraContactIssueCreator: JiraContactIssueCreatorPort) {}

  async execute(body: { name?: string; email?: string; phone?: string; company?: string; message?: string }): Promise<CreateTicketFromLandingResult> {
    const { name, email, phone, company, message } = body;

    if (!name || !email) {
      return { kind: 'validation_error', message: 'Name and email are required' };
    }

    if (!EMAIL_REGEX.test(email)) {
      return { kind: 'validation_error', message: 'Invalid email format' };
    }

    const formData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      company: company ? company.trim() : undefined,
      message: message ? message.trim() : 'Contact from landing page form',
      source: 'landing-page'
    };

    console.log('Creating ticket from landing page:', {
      name: formData.name,
      email: formData.email,
      company: formData.company,
      phone: formData.phone ? '***' : 'Not provided'
    });

    try {
      const jiraResponse = await this.jiraContactIssueCreator.createContactIssue(formData);
      console.log('Ticket created successfully:', jiraResponse.key);

      return {
        kind: 'ok',
        jiraIssue: {
          id: jiraResponse.id,
          key: jiraResponse.key,
          url: `${process.env.JIRA_BASE_URL}/browse/${jiraResponse.key}`
        }
      };
    } catch (error) {
      console.error('Error creating ticket from landing page:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create ticket';
      return { kind: 'error', message: errorMessage };
    }
  }
}
