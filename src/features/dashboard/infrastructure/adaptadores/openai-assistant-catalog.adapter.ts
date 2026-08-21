import { OpenAIService } from '../../../../services/openAI_service';
import { AssistantCatalogPort } from '../../domain/interfaces/assistant-catalog.port';
import { Assistant } from '../../domain/modelos/assistant.model';

export class OpenAiAssistantCatalogAdapter implements AssistantCatalogPort {
  private readonly openaiService: OpenAIService;

  constructor() {
    this.openaiService = new OpenAIService();
  }

  async listAssistants(): Promise<Assistant[]> {
    return this.openaiService.listAssistants();
  }
}
