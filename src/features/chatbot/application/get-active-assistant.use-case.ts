import { LegacyOpenAIChatPort } from '../domain/interfaces/legacy-openai-chat.port';

export class GetActiveAssistantUseCase {
  constructor(private readonly chat: LegacyOpenAIChatPort) {}

  execute(): string {
    return this.chat.getActiveAssistant();
  }
}
