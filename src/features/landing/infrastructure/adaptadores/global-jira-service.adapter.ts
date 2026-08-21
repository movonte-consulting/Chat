import { JiraService } from '../../../../services/jira_service';
import { JiraContactIssueCreatorPort } from '../../domain/interfaces/jira-contact-issue-creator.port';
import { ContactFormData } from '../../domain/modelos/contact-form-data.model';

/** Envuelve la instancia global (compartida) de Jira, no las credenciales de un usuario en particular. */
export class GlobalJiraServiceAdapter implements JiraContactIssueCreatorPort {
  async createContactIssue(formData: ContactFormData): Promise<{ id: string; key: string }> {
    return JiraService.getInstance().createContactIssue(formData as any);
  }
}
