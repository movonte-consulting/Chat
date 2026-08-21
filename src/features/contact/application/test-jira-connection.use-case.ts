import { JiraContactIssueCreatorPort } from '../domain/interfaces/jira-contact-issue-creator.port';

export class TestJiraConnectionUseCase {
  constructor(private readonly jiraContactIssueCreator: JiraContactIssueCreatorPort) {}

  async execute(): Promise<any> {
    return this.jiraContactIssueCreator.testConnection();
  }
}
