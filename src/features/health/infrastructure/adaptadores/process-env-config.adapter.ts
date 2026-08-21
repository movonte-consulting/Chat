import { EnvironmentConfigPort } from '../../domain/interfaces/environment-config.port';

export class ProcessEnvConfigAdapter implements EnvironmentConfigPort {
  isOpenAiConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  isAssistantIdConfigured(): boolean {
    return !!process.env.OPENAI_ASSISTANT_ID;
  }

  isJiraConfigured(): boolean {
    return !!(process.env.JIRA_EMAIL && process.env.JIRA_API_TOKEN);
  }

  jiraBaseUrl(): string {
    return process.env.JIRA_BASE_URL || 'Not configured';
  }

  isEmailConfigured(): boolean {
    return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  smtpHost(): string {
    return process.env.SMTP_HOST || 'Not configured';
  }

  nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }
}
