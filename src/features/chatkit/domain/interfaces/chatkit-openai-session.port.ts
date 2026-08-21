import { ChatKitSession } from '../modelos/chatkit-session.model';

export interface ChatKitOpenAiSessionPort {
  createSession(userId: string): Promise<ChatKitSession>;
  refreshSession(existingSecret: string): Promise<ChatKitSession>;
}
