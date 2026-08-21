/**
 * Estado en memoria del proceso de webhooks: dedup de comentarios, throttling por issue,
 * historial de conversación por issue, y estadísticas — igual que el ChatbotController original
 * (Set/Map por instancia, se resetean todos juntos en reset()).
 */

import { ConversationMessage } from '../../domain/modelos/conversation-message.model';
import { WebhookStats } from '../../domain/modelos/webhook-stats.model';
import { CommentDedupPort } from '../../domain/interfaces/comment-dedup.port';
import { ResponseThrottlePort, ThrottleCheck } from '../../domain/interfaces/response-throttle.port';
import { ConversationHistoryPort } from '../../domain/interfaces/conversation-history.port';
import { WebhookStatCounter, WebhookStatsPort, WebhookStatsSnapshot } from '../../domain/interfaces/webhook-stats.port';

const THROTTLE_DELAY_MS = 15000;
const MAX_PROCESSED_COMMENTS = 100;
const PROCESSED_COMMENTS_KEEP = 50;
const MAX_HISTORY_PER_ISSUE = 20;

function freshStats(): WebhookStats {
  return {
    totalReceived: 0,
    duplicatesSkipped: 0,
    aiCommentsSkipped: 0,
    successfulResponses: 0,
    errors: 0,
    throttledRequests: 0,
    lastReset: new Date()
  };
}

export class InMemoryWebhookStateRepository
  implements CommentDedupPort, ResponseThrottlePort, ConversationHistoryPort, WebhookStatsPort
{
  private processedComments = new Set<string>();
  private lastResponseTime = new Map<string, number>();
  private conversationHistory = new Map<string, ConversationMessage[]>();
  private webhookStats: WebhookStats = freshStats();

  // ── CommentDedupPort ──────────────────────────────────────────────────────
  isProcessed(commentId: string): boolean {
    return this.processedComments.has(commentId);
  }

  markProcessed(commentId: string): void {
    this.processedComments.add(commentId);
    if (this.processedComments.size > MAX_PROCESSED_COMMENTS) {
      const commentsArray = Array.from(this.processedComments);
      this.processedComments.clear();
      commentsArray.slice(-PROCESSED_COMMENTS_KEEP).forEach(id => this.processedComments.add(id));
    }
  }

  // ── ResponseThrottlePort ─────────────────────────────────────────────────
  check(issueKey: string): ThrottleCheck {
    const now = Date.now();
    const lastResponse = this.lastResponseTime.get(issueKey) || 0;
    const elapsed = now - lastResponse;

    if (elapsed < THROTTLE_DELAY_MS) {
      return {
        throttled: true,
        remainingSeconds: Math.ceil((THROTTLE_DELAY_MS - elapsed) / 1000),
        checkedAt: now
      };
    }
    return { throttled: false, checkedAt: now };
  }

  markResponded(issueKey: string, checkedAt: number): void {
    this.lastResponseTime.set(issueKey, checkedAt);
  }

  // ── ConversationHistoryPort ──────────────────────────────────────────────
  add(issueKey: string, role: string, content: string): void {
    if (!this.conversationHistory.has(issueKey)) {
      this.conversationHistory.set(issueKey, []);
    }
    const history = this.conversationHistory.get(issueKey)!;
    history.push({ role, content, timestamp: new Date() });
    if (history.length > MAX_HISTORY_PER_ISSUE) {
      history.splice(0, history.length - MAX_HISTORY_PER_ISSUE);
    }
  }

  get(issueKey: string): ConversationMessage[] {
    return this.conversationHistory.get(issueKey) || [];
  }

  // ── WebhookStatsPort ─────────────────────────────────────────────────────
  getSnapshot(): WebhookStatsSnapshot {
    return {
      ...this.webhookStats,
      processedCommentsCount: this.processedComments.size,
      uptime: Date.now() - this.webhookStats.lastReset.getTime()
    };
  }

  increment(counter: WebhookStatCounter): void {
    this.webhookStats[counter]++;
  }

  reset(): void {
    this.webhookStats = freshStats();
    this.processedComments.clear();
    this.lastResponseTime.clear();
    this.conversationHistory.clear();
  }
}
