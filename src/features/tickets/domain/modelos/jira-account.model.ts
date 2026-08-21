export interface JiraCredentials {
  email: string;
  token: string;
  url: string;
}

/** Fila pública de service_jira_accounts (sin tokens, igual que la respuesta actual del GET). */
export interface JiraAccountRecord {
  id: number;
  user_id: number;
  service_id: string;
  assistant_jira_email: string | null;
  assistant_jira_url: string | null;
  widget_jira_email: string | null;
  widget_jira_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UpsertJiraAccountsInput {
  assistantJiraEmail?: string | null;
  assistantJiraToken?: string | null;
  assistantJiraUrl?: string | null;
  widgetJiraEmail?: string | null;
  widgetJiraToken?: string | null;
  widgetJiraUrl?: string | null;
  isActive?: boolean;
}
