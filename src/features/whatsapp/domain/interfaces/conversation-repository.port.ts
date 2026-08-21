import { Conversation } from '../modelos/conversation.model';

export interface ConversationRepositoryPort {
  normalizePhone(phone: string): string;
  getConversation(phone: string): Promise<Conversation | null>;
  getOrCreateConversation(phone: string, phoneNumberId: string, userId: number): Promise<Conversation>;
  activateConversation(phone: string, issueKey: string, serviceId: string): Promise<void>;
  updateThreadId(phone: string, threadId: string): Promise<void>;
  findByIssueKey(issueKey: string): Promise<Conversation | null>;
  isMessageProcessed(phone: string, msgId: string): Promise<boolean>;
  markMessageProcessed(phone: string, msgId: string): Promise<void>;
  resetConversation(phone: string): Promise<void>;
}
