import { OpenAIService } from '../../../../services/openAI_service';
import { AssistantCatalogPort, AssistantSummary } from '../../domain/interfaces/assistant-catalog.port';

export class AssistantCatalogAdapter implements AssistantCatalogPort {
  private readonly openaiService = new OpenAIService();

  async listAssistants(): Promise<AssistantSummary[]> {
    return this.openaiService.listAssistants() as any;
  }
}
