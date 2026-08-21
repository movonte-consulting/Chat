export interface AssistantSummary {
  id: string;
  name: string;
  description?: string;
  model: string;
  created_at: number;
}

export interface AssistantCatalogPort {
  listAssistants(): Promise<AssistantSummary[]>;
}
