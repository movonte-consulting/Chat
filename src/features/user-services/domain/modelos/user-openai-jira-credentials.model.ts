export interface UserOpenAiJiraCredentials {
  userId: number;
  role: string;
  email: string;
  openaiToken: string | null;
  jiraToken: string | null;
  jiraUrl: string | null;
}
