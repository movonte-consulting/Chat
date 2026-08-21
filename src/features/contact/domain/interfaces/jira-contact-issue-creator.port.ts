import { ContactFormData } from '../modelos/contact-form-data.model';

export interface JiraContactIssueCreatorPort {
  createContactIssue(formData: ContactFormData): Promise<{ id: string; key: string }>;
  testConnection(): Promise<any>;
}
