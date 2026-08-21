export interface ChatbotUser {
  id: number;
  email: string;
  openaiToken: string | null;
  jiraToken: string | null;
  jiraUrl: string | null;
}

export interface ChatbotUserLookupPort {
  findById(userId: number): Promise<ChatbotUser | null>;
}
