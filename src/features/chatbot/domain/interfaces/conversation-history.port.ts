import { ConversationMessage } from '../modelos/conversation-message.model';

export interface ConversationHistoryPort {
  add(issueKey: string, role: string, content: string): void;
  get(issueKey: string): ConversationMessage[];
}
