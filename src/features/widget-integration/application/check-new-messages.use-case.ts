import { GlobalJiraPort } from '../domain/interfaces/global-jira.port';
import { FormattedComment } from '../domain/modelos/comment.model';

export type CheckNewMessagesResult =
  | { kind: 'validation_error'; message: string }
  | {
      kind: 'ok';
      newMessages: FormattedComment[];
      hasNewMessages: boolean;
      lastMessageId: string | null;
      totalMessages: number;
    };

function extractTextFromADFContent(content: any[]): string {
  let text = '';
  for (const item of content) {
    if (item.type === 'text' && item.text) {
      text += item.text;
    } else if (item.content && Array.isArray(item.content)) {
      text += extractTextFromADFContent(item.content);
    }
  }
  return text;
}

function extractTextFromADF(body: any): string {
  if (typeof body === 'string') {
    return body;
  }
  if (body && body.content && Array.isArray(body.content)) {
    return extractTextFromADFContent(body.content);
  }
  return '';
}

const AGENT_EMAILS = [
  'isaac.toledo@movonte.com',
  'isaac@movonte.com',
  'admin@movonte.com'
];

function isAgentComment(comment: any): boolean {
  const authorEmail = comment.author.emailAddress?.toLowerCase() || '';
  const authorDisplayName = comment.author.displayName?.toLowerCase() || '';

  const isInternalNote = comment.jsdPublic === false;

  const isFromAgentEmail = AGENT_EMAILS.some(email => authorEmail.includes(email.toLowerCase()));

  const isAgentName =
    authorDisplayName.includes('isaac') ||
    authorDisplayName.includes('toledo') ||
    authorDisplayName.includes('agent') ||
    authorDisplayName.includes('admin');

  return isInternalNote || isFromAgentEmail || isAgentName;
}

const AI_CONTENT_PATTERNS = [
  'complete.',
  'how can i assist you',
  '🎯 **chat session started**',
  'chat widget connected',
  'as an atlassian solution partner',
  'offers integration services'
];

function isAIComment(comment: any): boolean {
  const authorEmail = comment.author.emailAddress?.toLowerCase() || '';
  const commentBody = extractTextFromADF(comment.body).toLowerCase();

  const aiEmail = process.env.JIRA_EMAIL?.toLowerCase() || '';
  const isFromAIAccount = authorEmail === aiEmail;

  const isAIContent = AI_CONTENT_PATTERNS.some(pattern => commentBody.includes(pattern));

  return isFromAIAccount || isAIContent;
}

export class CheckNewMessagesUseCase {
  constructor(private readonly globalJira: GlobalJiraPort) {}

  async execute(issueKey: unknown, lastMessageId: unknown): Promise<CheckNewMessagesResult> {
    if (!issueKey || typeof issueKey !== 'string') {
      return { kind: 'validation_error', message: 'Missing or invalid issueKey parameter' };
    }

    console.log(`🔍 Checking for new messages in ticket ${issueKey} since message ${lastMessageId}`);

    const commentsResponse = await this.globalJira.getIssueComments(issueKey);
    const commentsArray: any[] = commentsResponse?.comments || [];

    if (commentsArray.length === 0) {
      return { kind: 'ok', newMessages: [], hasNewMessages: false, lastMessageId: null, totalMessages: 0 };
    }

    let newMessages = commentsArray;
    if (lastMessageId && lastMessageId !== 'null' && lastMessageId !== 'undefined' && lastMessageId !== '') {
      const lastMessageIndex = commentsArray.findIndex((comment: any) => comment.id === lastMessageId);
      if (lastMessageIndex !== -1) {
        newMessages = commentsArray.slice(lastMessageIndex + 1);
      } else {
        console.log(`⚠️ Last message ID ${lastMessageId} not found, returning all messages`);
      }
    } else {
      console.log(`📋 First time polling or invalid lastMessageId (${lastMessageId}), returning all messages`);
    }

    const formattedMessages: FormattedComment[] = newMessages.map((comment: any) => {
      const isFromAI = isAIComment(comment);
      const isFromAgent = isAgentComment(comment);

      return {
        id: comment.id,
        body: extractTextFromADF(comment.body),
        author: {
          displayName: comment.author.displayName,
          emailAddress: comment.author.emailAddress
        },
        created: comment.created,
        isFromAI,
        isFromAgent,
        source: isFromAI ? 'assistant' : (isFromAgent ? 'agent' : 'user')
      };
    });

    const latestMessageId = commentsArray.length > 0 ? commentsArray[commentsArray.length - 1].id : null;

    console.log(`📊 Polling response for ${issueKey}:`, {
      totalComments: commentsArray.length,
      newMessages: formattedMessages.length,
      latestMessageId,
      lastKnownId: lastMessageId
    });

    return {
      kind: 'ok',
      newMessages: formattedMessages,
      hasNewMessages: formattedMessages.length > 0,
      lastMessageId: latestMessageId,
      totalMessages: commentsArray.length
    };
  }
}
