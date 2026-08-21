import { JiraContactIssueCreatorPort } from '../domain/interfaces/jira-contact-issue-creator.port';
import { ContactFormData, JiraIssueSummary } from '../domain/modelos/contact-form-data.model';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export type SubmitContactFormResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'jira_error' }
  | { kind: 'ok'; jiraIssue: JiraIssueSummary };

export class SubmitContactFormUseCase {
  constructor(private readonly jiraContactIssueCreator: JiraContactIssueCreatorPort) {}

  async execute(formData: ContactFormData): Promise<SubmitContactFormResult> {
    if (!formData.name || !formData.email || !formData.message) {
      return { kind: 'validation_error', message: 'Campos requeridos: name, email, message' };
    }

    if (!isValidEmail(formData.email)) {
      return { kind: 'validation_error', message: 'Email no válido' };
    }

    console.log('Processing contact form:', {
      name: formData.name,
      email: formData.email,
      company: formData.company || 'N/A'
    });

    try {
      const jiraIssue = await this.jiraContactIssueCreator.createContactIssue(formData);
      console.log(`Ticket de Jira creado exitosamente: ${jiraIssue.key}`);
      return {
        kind: 'ok',
        jiraIssue: {
          id: jiraIssue.id,
          key: jiraIssue.key,
          url: `${process.env.JIRA_BASE_URL}/browse/${jiraIssue.key}`
        }
      };
    } catch (jiraError) {
      console.error('Error creating Jira ticket:', jiraError);
      return { kind: 'jira_error' };
    }
  }
}
