export interface OwnJiraCredentials {
  email: string;
  jiraToken: string | null;
  jiraUrl: string | null;
}

export interface JiraAiCommentPort {
  /**
   * Comenta la respuesta de la IA en el ticket. Prioriza la cuenta Jira "assistant" configurada
   * para el servicio; si no existe, usa ownCredentials (las credenciales propias del usuario).
   */
  addAiResponseComment(
    userId: number,
    serviceId: string,
    issueKey: string,
    text: string,
    ownCredentials: OwnJiraCredentials
  ): Promise<{ accountId?: string }>;
}
