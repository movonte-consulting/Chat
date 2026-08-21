import { LegacyOpenAIChatPort } from '../domain/interfaces/legacy-openai-chat.port';

export class SetActiveAssistantUseCase {
  constructor(private readonly chat: LegacyOpenAIChatPort) {}

  execute(assistantId: string): void {
    this.chat.setActiveAssistant(assistantId);
  }
}
