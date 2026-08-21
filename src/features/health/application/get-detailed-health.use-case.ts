import { EnvironmentConfigPort } from '../domain/interfaces/environment-config.port';
import { DetailedHealthStatus } from '../domain/modelos/health-status.model';

export class GetDetailedHealthUseCase {
  constructor(private readonly environmentConfig: EnvironmentConfigPort) {}

  execute(): DetailedHealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        openai: {
          configured: this.environmentConfig.isOpenAiConfigured(),
          assistantId: this.environmentConfig.isAssistantIdConfigured()
        },
        jira: {
          configured: this.environmentConfig.isJiraConfigured(),
          baseUrl: this.environmentConfig.jiraBaseUrl()
        },
        email: {
          configured: this.environmentConfig.isEmailConfigured(),
          host: this.environmentConfig.smtpHost()
        }
      },
      environment: this.environmentConfig.nodeEnv()
    };
  }
}
