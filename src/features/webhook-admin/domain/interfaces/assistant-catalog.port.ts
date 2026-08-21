import { Assistant } from '../modelos/assistant.model';

export interface AssistantCatalogPort {
  listAssistants(): Promise<Assistant[]>;
}
