import { JiraCredentials } from '../modelos/jira-account.model';

export interface UserJiraCredentialsProviderPort {
  /** Credenciales Jira propias del usuario (perfil), o null si no las tiene configuradas. */
  getOwnCredentials(userId: number): Promise<JiraCredentials | null>;
}
