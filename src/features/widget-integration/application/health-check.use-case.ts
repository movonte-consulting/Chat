import { GlobalJiraPort } from '../domain/interfaces/global-jira.port';

export class HealthCheckUseCase {
  constructor(private readonly globalJira: GlobalJiraPort) {}

  async execute(): Promise<void> {
    await this.globalJira.testConnection();
  }
}
