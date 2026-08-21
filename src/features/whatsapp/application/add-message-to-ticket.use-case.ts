import { JiraCommenterPort } from '../domain/interfaces/jira-commenter.port';

/** Phase 2: add a customer WhatsApp message as a comment on the linked Jira ticket. */
export class AddMessageToTicketUseCase {
  constructor(private readonly jiraCommenter: JiraCommenterPort) {}

  async execute(
    senderName: string,
    text: string,
    issueKey: string,
    serviceId: string,
    userId: number
  ): Promise<void> {
    const commentText = `[WhatsApp] ${senderName}: ${text}`;
    await this.jiraCommenter.addComment(userId, serviceId, issueKey, commentText);
  }
}
