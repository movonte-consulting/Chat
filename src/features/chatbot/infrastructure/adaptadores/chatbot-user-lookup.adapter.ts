import { User } from '../../../../models';
import { ChatbotUser, ChatbotUserLookupPort } from '../../domain/interfaces/chatbot-user-lookup.port';

export class ChatbotUserLookupAdapter implements ChatbotUserLookupPort {
  async findById(userId: number): Promise<ChatbotUser | null> {
    const user = await User.findByPk(userId);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      openaiToken: user.openaiToken ?? null,
      jiraToken: user.jiraToken ?? null,
      jiraUrl: (user as any).jiraUrl ?? null
    };
  }
}
