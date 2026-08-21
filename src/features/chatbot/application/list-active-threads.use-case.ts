import { ActiveThreadInfo, LegacyOpenAIChatPort } from '../domain/interfaces/legacy-openai-chat.port';

export class ListActiveThreadsUseCase {
  constructor(private readonly chat: LegacyOpenAIChatPort) {}

  execute(): ActiveThreadInfo[] {
    return this.chat.getActiveThreads();
  }
}
