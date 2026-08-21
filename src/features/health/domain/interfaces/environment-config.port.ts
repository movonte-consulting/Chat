export interface EnvironmentConfigPort {
  isOpenAiConfigured(): boolean;
  isAssistantIdConfigured(): boolean;
  isJiraConfigured(): boolean;
  jiraBaseUrl(): string;
  isEmailConfigured(): boolean;
  smtpHost(): string;
  nodeEnv(): string;
}
