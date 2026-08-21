/**
 * Rama comment_created de handleJiraWebhook — el flujo más grande del feature: resuelve el
 * servicio dueño del ticket, deduplica, filtra comentarios de IA/widget, aplica throttling,
 * respeta el toggle de "asistente desactivado" por usuario, llama al asistente del usuario,
 * comenta la respuesta en Jira, notifica a WhatsApp y dispara el flujo paralelo de webhooks.
 *
 * Preserva deliberadamente un par de detalles "raros" del original (no se corrigen aquí):
 *  - updateWebhookStats(true) se llama SIEMPRE tras invocar al asistente, sin importar si la
 *    respuesta fue exitosa o no.
 *  - successfulResponses solo se incrementa si el comentario en Jira se agrega sin error (queda
 *    anidado dentro del try/catch de jira-ai-comment, igual que en el controller original).
 */

import { JiraWebhookPayload } from '../../../types';
import { extractTextFromADF, isAIComment, isWidgetComment } from '../domain/modelos/jira-comment.model';
import { ChatbotAssistantResponse } from '../domain/modelos/chatbot-response.model';
import { UserServiceResolverPort } from '../domain/interfaces/user-service-resolver.port';
import { CommentDedupPort } from '../domain/interfaces/comment-dedup.port';
import { WebSocketNotifierPort } from '../domain/interfaces/websocket-notifier.port';
import { ResponseThrottlePort } from '../domain/interfaces/response-throttle.port';
import { UserTicketTogglePort } from '../domain/interfaces/user-ticket-toggle.port';
import { ConversationHistoryPort } from '../domain/interfaces/conversation-history.port';
import { ChatbotUserLookupPort } from '../domain/interfaces/chatbot-user-lookup.port';
import { AssistantChatPort } from '../domain/interfaces/assistant-chat.port';
import { WebhookStatsPort } from '../domain/interfaces/webhook-stats.port';
import { WebhookStatsPersistencePort } from '../domain/interfaces/webhook-stats-persistence.port';
import { JiraAiCommentPort } from '../domain/interfaces/jira-ai-comment.port';
import { WhatsAppNotifierPort } from '../domain/interfaces/whatsapp-notifier.port';
import { RunParallelWebhookFlowUseCase } from './run-parallel-webhook-flow.use-case';

type JiraComment = NonNullable<JiraWebhookPayload['comment']>;
type JiraIssue = JiraWebhookPayload['issue'];

export type ProcessCommentCreatedResult =
  | { kind: 'ignored'; issueKey: string }
  | { kind: 'duplicate' }
  | { kind: 'ai_comment' }
  | { kind: 'widget_comment' }
  | { kind: 'throttled'; remainingSeconds: number }
  | { kind: 'empty_comment' }
  | { kind: 'disabled'; reason?: string }
  | { kind: 'no_token' }
  | { kind: 'processed'; response: ChatbotAssistantResponse };

export class ProcessCommentCreatedUseCase {
  constructor(
    private readonly userServiceResolver: UserServiceResolverPort,
    private readonly commentDedup: CommentDedupPort,
    private readonly webSocketNotifier: WebSocketNotifierPort,
    private readonly responseThrottle: ResponseThrottlePort,
    private readonly userTicketToggle: UserTicketTogglePort,
    private readonly conversationHistory: ConversationHistoryPort,
    private readonly chatbotUserLookup: ChatbotUserLookupPort,
    private readonly assistantChat: AssistantChatPort,
    private readonly webhookStats: WebhookStatsPort,
    private readonly webhookStatsPersistence: WebhookStatsPersistencePort,
    private readonly jiraAiComment: JiraAiCommentPort,
    private readonly whatsappNotifier: WhatsAppNotifierPort,
    private readonly runParallelWebhookFlow: RunParallelWebhookFlowUseCase
  ) {}

  async execute(issue: JiraIssue, comment: JiraComment): Promise<ProcessCommentCreatedResult> {
    const issueKey = issue.key;
    const commentMessage = extractTextFromADF(comment.body);
    const issueProjectKey = issueKey.split('-')[0];

    const userServiceInfo = await this.userServiceResolver.findByProjectKey(issueProjectKey, { requireApproved: true });
    if (!userServiceInfo) {
      console.log(`🚫 TICKET IGNORADO: ${issueKey} no pertenece a ningún servicio de usuario activo`);
      return { kind: 'ignored', issueKey };
    }

    const commentId = `${issueKey}_${comment.id}_${comment.created}_${comment.author.accountId}`;
    if (this.commentDedup.isProcessed(commentId)) {
      this.webhookStats.increment('duplicatesSkipped');
      console.log(`⚠️ DUPLICADO DETECTADO: ${commentId}`);
      return { kind: 'duplicate' };
    }
    this.commentDedup.markProcessed(commentId);

    if (isAIComment(comment)) {
      this.webhookStats.increment('aiCommentsSkipped');
      console.log(`🤖 COMENTARIO DE IA DETECTADO: ${comment.author.displayName}`);
      this.webSocketNotifier.emitComment(issueKey, {
        message: commentMessage,
        author: comment.author.displayName,
        timestamp: comment.created,
        source: 'jira-ai',
        issueKey,
        isAI: true
      });
      return { kind: 'ai_comment' };
    }

    if (isWidgetComment(comment)) {
      this.webhookStats.increment('aiCommentsSkipped');
      console.log(`📱 COMENTARIO DEL WIDGET DETECTADO: ${comment.author.displayName}`);
      return { kind: 'widget_comment' };
    }

    const throttleCheck = this.responseThrottle.check(issueKey);
    if (throttleCheck.throttled) {
      this.webhookStats.increment('throttledRequests');
      console.log(`🚫 THROTTLING: Demasiado pronto para responder a ${issueKey}`);
      return { kind: 'throttled', remainingSeconds: throttleCheck.remainingSeconds! };
    }

    if (!commentMessage || commentMessage.trim().length === 0) {
      console.log(`⚠️ COMENTARIO VACÍO - No se puede procesar`);
      return { kind: 'empty_comment' };
    }

    this.webSocketNotifier.emitComment(issueKey, {
      message: commentMessage,
      author: comment.author.displayName,
      timestamp: comment.created,
      source: 'jira-agent',
      issueKey,
      isAI: false
    });

    const isDisabled = await this.userTicketToggle.isDisabled(userServiceInfo.userId, issueKey);
    if (isDisabled) {
      const disableInfo = await this.userTicketToggle.getDisableInfo(userServiceInfo.userId, issueKey);
      console.log(`🚫 ASISTENTE DESACTIVADO PARA TICKET ${issueKey} POR USUARIO ${userServiceInfo.userId}`);
      return { kind: 'disabled', reason: disableInfo?.reason };
    }

    this.conversationHistory.add(issueKey, 'user', commentMessage);
    const history = this.conversationHistory.get(issueKey);

    const enrichedContext = {
      jiraIssueKey: issueKey,
      issueSummary: issue.fields?.summary || 'No summary available',
      issueStatus: issue.fields?.status?.name || 'Unknown',
      authorName: comment.author.displayName,
      isJiraComment: true,
      conversationType: 'jira-ticket',
      conversationHistory: history.slice(-6),
      previousResponses: history.filter(msg => msg.role === 'assistant').slice(-3).map(msg => msg.content)
    };

    const user = await this.chatbotUserLookup.findById(userServiceInfo.userId);
    if (!user || !user.openaiToken) {
      console.error(`❌ Usuario ${userServiceInfo.userId} no tiene token de OpenAI configurado`);
      return { kind: 'no_token' };
    }

    const response = await this.assistantChat.processForUserService(
      userServiceInfo.userId,
      user.openaiToken,
      commentMessage,
      userServiceInfo.serviceId,
      `jira_${issueKey}`,
      enrichedContext
    );

    this.responseThrottle.markResponded(issueKey, throttleCheck.checkedAt);
    // Se registra como éxito incondicionalmente tras invocar al asistente — comportamiento
    // preexistente del controller original, no se corrige aquí.
    await this.webhookStatsPersistence.recordResult(true);

    if (response.success && response.response) {
      try {
        console.log(`📤 Agregando comentario a Jira: "${response.response.substring(0, 50)}..."`);
        await this.jiraAiComment.addAiResponseComment(
          userServiceInfo.userId,
          userServiceInfo.serviceId,
          issueKey,
          response.response,
          { email: user.email, jiraToken: user.jiraToken, jiraUrl: user.jiraUrl }
        );
        this.webhookStats.increment('successfulResponses');
        console.log(`✅ Comentario agregado exitosamente a Jira`);

        this.conversationHistory.add(issueKey, 'assistant', response.response);

        try {
          await this.whatsappNotifier.notify(issueKey, response.response);
        } catch (waError) {
          console.error('⚠️ No se pudo enviar respuesta a WhatsApp (no afecta flujo Jira):', waError);
        }
      } catch (jiraError) {
        console.error('❌ Error adding AI response to Jira:', jiraError);
      }

      await this.runParallelWebhookFlow.execute({
        issueKey,
        userServiceInfo,
        user,
        commentMessage,
        authorName: comment.author.displayName,
        issue,
        comment,
        issueSummary: enrichedContext.issueSummary,
        issueStatus: enrichedContext.issueStatus,
        mainResponseText: response.response
      });
    } else {
      console.log(`❌ Respuesta de asistente tradicional fallida o vacía:`, {
        success: response.success,
        hasResponse: !!response.response,
        error: response.error
      });
    }

    return { kind: 'processed', response };
  }
}
