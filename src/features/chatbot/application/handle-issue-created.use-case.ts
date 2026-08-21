/** Rama jira:issue_created de handleJiraWebhook. */

import { JiraWebhookPayload } from '../../../types';
import { isWebContactTicket } from '../domain/modelos/jira-comment.model';
import { UserServiceResolverPort } from '../domain/interfaces/user-service-resolver.port';

type JiraIssue = JiraWebhookPayload['issue'];

export type HandleIssueCreatedResult =
  | { kind: 'ignored'; issueKey: string }
  | { kind: 'processed'; issueKey: string; isWebContact: boolean };

export class HandleIssueCreatedUseCase {
  constructor(private readonly userServiceResolver: UserServiceResolverPort) {}

  async execute(issue: JiraIssue): Promise<HandleIssueCreatedResult> {
    const issueKey = issue.key;
    const issueProjectKey = issueKey.split('-')[0];

    // Los flujos de issue_created no filtran por approval_status (comportamiento existente).
    const userServiceInfo = await this.userServiceResolver.findByProjectKey(issueProjectKey, { requireApproved: false });
    if (!userServiceInfo) {
      console.log(`🚫 TICKET CREADO IGNORADO: ${issueKey} no pertenece a ningún servicio de usuario activo`);
      return { kind: 'ignored', issueKey };
    }

    console.log(`🎫 NUEVO TICKET CREADO: ${issueKey} — ${issue.fields?.summary || 'No summary available'}`);

    const isWebContact = isWebContactTicket({
      labels: issue.fields?.labels,
      summary: issue.fields?.summary
    });

    if (isWebContact) {
      console.log(`🌐 TICKET DE CONTACTO WEB CREADO SIN MENSAJE DE BIENVENIDA: ${issueKey}`);
    }

    return { kind: 'processed', issueKey, isWebContact };
  }
}
