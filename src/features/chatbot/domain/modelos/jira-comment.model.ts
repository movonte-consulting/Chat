/** Lógica pura de clasificación de comentarios de Jira. Sin IO. */

export interface JiraCommentAuthor {
  displayName: string;
  emailAddress?: string;
  accountId: string;
}

export interface JiraCommentLike {
  author: JiraCommentAuthor;
  body: any;
}

/** Extrae texto plano del formato ADF de Jira (maneja todos los tipos de nodos). */
export function extractTextFromADF(adfBody: any): string {
  if (typeof adfBody === 'string') {
    return adfBody;
  }

  if (!adfBody) {
    return '';
  }

  if (adfBody.content && Array.isArray(adfBody.content)) {
    return extractTextFromADFContent(adfBody.content);
  }

  return '';
}

/** Recorrido recursivo de contenido ADF. */
export function extractTextFromADFContent(content: any[]): string {
  if (!Array.isArray(content)) {
    return '';
  }

  let text = '';

  for (const item of content) {
    if (!item) continue;

    if (item.type === 'text' && item.text) {
      text += item.text;
    } else if (item.content && Array.isArray(item.content)) {
      const nestedText = extractTextFromADFContent(item.content);
      if (nestedText) {
        text += nestedText;
        if (item.type === 'paragraph' || item.type === 'heading') {
          text += ' ';
        } else if (item.type === 'listItem' || item.type === 'bulletList' || item.type === 'orderedList') {
          text += ' ';
        } else if (item.type === 'hardBreak') {
          text += '\n';
        }
      }
    } else if (item.type === 'hardBreak') {
      text += '\n';
    }
  }

  return text.trim();
}

/** Detecta si un comentario de Jira fue publicado por la propia IA. */
export function isAIComment(comment: JiraCommentLike): boolean {
  const authorEmail = comment.author.emailAddress?.toLowerCase() || '';
  const commentBodyText = extractTextFromADF(comment.body).toLowerCase();
  const authorDisplayName = comment.author.displayName?.toLowerCase() || '';

  const aiEmail = process.env.JIRA_EMAIL?.toLowerCase() || '';
  const isFromAIAccount = authorEmail === aiEmail;

  const isFromAIDisplayName = authorDisplayName.includes('ai assistant') ||
                              authorDisplayName.includes('contact service account') ||
                              authorDisplayName.includes('contact service');

  const aiContentPatterns = [
    'complete.', 'how can i assist you',
    '🎯 **chat session started**', 'chat widget connected',
    'as an atlassian solution partner', 'offers integration services',
    'estoy aquí para ayudarte', '¿sobre qué tema te gustaría saber',
    'basada en los documentos disponibles'
  ];

  const isAIContent = aiContentPatterns.some(pattern =>
    commentBodyText.includes(pattern)
  );

  return isFromAIAccount || isFromAIDisplayName || isAIContent;
}

/** Detecta si un comentario de Jira fue publicado por el widget de chat. */
export function isWidgetComment(comment: JiraCommentLike): boolean {
  const authorEmail = comment.author.emailAddress?.toLowerCase() || '';
  const authorDisplayName = comment.author.displayName?.toLowerCase() || '';

  const widgetEmail = process.env.JIRA_WIDGET?.toLowerCase() || '';
  const isFromWidgetAccount = authorEmail === widgetEmail;

  const isWidgetDisplayName = authorDisplayName.includes('widget') ||
                             authorDisplayName.includes('chat widget') ||
                             authorDisplayName.includes('system');

  return isFromWidgetAccount || isWidgetDisplayName;
}

/** Detecta si un ticket recién creado corresponde a un contacto web (por labels o summary). */
export function isWebContactTicket(fields: { labels?: string[]; summary?: string }): boolean {
  return Boolean(
    fields.labels?.includes('contacto-web') ||
    fields.labels?.includes('lead') ||
    fields.summary?.toLowerCase().includes('web contact')
  );
}
