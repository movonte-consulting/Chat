import { LegacyOpenAIChatPort, ThreadHistoryResult } from '../domain/interfaces/legacy-openai-chat.port';

export class GetThreadHistoryUseCase {
  constructor(private readonly chat: LegacyOpenAIChatPort) {}

  execute(threadId: string): Promise<ThreadHistoryResult> {
    return this.chat.getThreadHistory(threadId);
  }
}
