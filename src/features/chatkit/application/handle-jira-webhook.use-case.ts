import { ChatKitJiraPort } from '../domain/interfaces/chatkit-jira.port';
import { JiraWebhookPayload } from '../domain/modelos/jira-webhook-payload.model';

export type HandleJiraWebhookResult =
  | { kind: 'ignored'; message: string }
  | { kind: 'failed'; message: string }
  | { kind: 'ok'; sessionId?: string };

function extractTextFromADF(adfBody: any): string {
  if (typeof adfBody === 'string') {
    return adfBody;
  }

  if (adfBody && adfBody.content) {
    let text = '';
    for (const node of adfBody.content) {
      if (node.type === 'paragraph' && node.content) {
        for (const contentNode of node.content) {
          if (contentNode.type === 'text' && contentNode.text) {
            text += contentNode.text + ' ';
          }
        }
      }
    }
    return text.trim();
  }

  return '';
}

function isWidgetComment(commentBody: string, authorInfo: any): boolean {
  if (
    authorInfo.displayName === 'Chat User' ||
    authorInfo.email?.includes('widget') ||
    authorInfo.displayName?.includes('Widget')
  ) {
    return true;
  }

  if (commentBody.includes('[Widget]') || commentBody.includes('Source: widget')) {
    return true;
  }

  return false;
}

function isAIComment(commentBody: string, authorInfo: any): boolean {
  if (
    authorInfo.displayName === 'AI Assistant' ||
    authorInfo.email === 'ai@movonte.com' ||
    authorInfo.displayName?.includes('AI')
  ) {
    return true;
  }

  if (commentBody.includes('[AI Response]') || commentBody.includes('Source: chatkit')) {
    return true;
  }

  return false;
}

export class HandleJiraWebhookUseCase {
  constructor(private readonly chatKitJira: ChatKitJiraPort) {}

  async execute(payload: JiraWebhookPayload): Promise<HandleJiraWebhookResult> {
    console.log(`📥 Webhook de Jira recibido: ${payload.webhookEvent}`);

    if (payload.webhookEvent !== 'comment_created') {
      console.log(`⚠️ Evento no procesado: ${payload.webhookEvent}`);
      return { kind: 'ignored', message: 'Evento no procesado' };
    }

    const issueKey = payload.issue.key;
    const commentBodyText = extractTextFromADF(payload.comment.body);
    const authorInfo = {
      displayName: payload.comment.author.displayName,
      email: payload.comment.author.emailAddress
    };

    console.log(`💬 Comentario de ${authorInfo.displayName} en ${issueKey}: ${commentBodyText}`);

    if (isWidgetComment(commentBodyText, authorInfo)) {
      console.log(`🚫 Comentario del widget filtrado`);
      return { kind: 'ignored', message: 'Comentario del widget filtrado' };
    }

    if (isAIComment(commentBodyText, authorInfo)) {
      console.log(`🚫 Comentario de IA filtrado`);
      return { kind: 'ignored', message: 'Comentario de IA filtrado' };
    }

    const result = await this.chatKitJira.processJiraComment(issueKey, commentBodyText, authorInfo);

    if (!result.success) {
      console.error(`❌ Error procesando comentario para ${issueKey}: ${result.error}`);
      return { kind: 'failed', message: result.error || 'Error procesando comentario' };
    }

    console.log(`✅ Comentario procesado exitosamente para ${issueKey}`);
    return { kind: 'ok', sessionId: result.sessionId };
  }
}
