import { AssistantInfo, LegacyOpenAIChatPort } from '../domain/interfaces/legacy-openai-chat.port';

export class ListAssistantsUseCase {
  constructor(private readonly chat: LegacyOpenAIChatPort) {}

  execute(): Promise<AssistantInfo[]> {
    return this.chat.listAssistants();
  }
}
