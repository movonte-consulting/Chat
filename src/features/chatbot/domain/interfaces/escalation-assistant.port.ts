export interface EscalationAssistantResult {
  response: string;
}

/** Corre un thread de OpenAI ad-hoc contra el asistente de escalación (webhook-parallel). */
export interface EscalationAssistantPort {
  run(openaiToken: string, assistantId: string, message: string, issueKey: string): Promise<EscalationAssistantResult>;
}
