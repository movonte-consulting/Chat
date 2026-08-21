import { JiraAccountRecord, JiraCredentials, UpsertJiraAccountsInput } from '../modelos/jira-account.model';

export interface JiraAccountRepositoryPort {
  findByUserAndService(userId: number, serviceId: string): Promise<JiraAccountRecord | null>;
  /** true si el usuario tiene acceso al servicio (existe en unified_configurations), sin filtrar por is_active. */
  verifyServiceAccess(userId: number, serviceId: string): Promise<boolean>;
  upsert(userId: number, serviceId: string, input: UpsertJiraAccountsInput): Promise<JiraAccountRecord>;
  delete(userId: number, serviceId: string): Promise<void>;
  getAssistantAccount(userId: number, serviceId: string): Promise<JiraCredentials | null>;
  getWidgetAccount(userId: number, serviceId: string): Promise<JiraCredentials | null>;
}
