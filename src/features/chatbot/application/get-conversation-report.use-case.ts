import { ConversationHistoryPort } from '../domain/interfaces/conversation-history.port';
import { LegacyOpenAIChatPort } from '../domain/interfaces/legacy-openai-chat.port';
import { ConversationMessage } from '../domain/modelos/conversation-message.model';

export type ConversationReportResult =
  | { hasHistory: false; issueKey: string }
  | {
      hasHistory: true;
      issueKey: string;
      report: string;
      messageCount: number;
      participants: string[];
      conversationHistory: ConversationMessage[];
      generatedAt: string;
    };

export class GetConversationReportUseCase {
  constructor(
    private readonly conversationHistory: ConversationHistoryPort,
    private readonly chat: LegacyOpenAIChatPort
  ) {}

  async execute(issueKey: string): Promise<ConversationReportResult> {
    const history = this.conversationHistory.get(issueKey);

    if (history.length === 0) {
      return { hasHistory: false, issueKey };
    }

    const reportPrompt = `Analiza la siguiente conversación y genera un reporte detallado:

CONVERSACIÓN:
${history.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

Por favor, genera un reporte que incluya:
1. Resumen de la conversación
2. Temas principales discutidos
3. Problemas identificados
4. Soluciones propuestas
5. Estado actual de la conversación
6. Recomendaciones para el agente de soporte

Formato el reporte de manera clara y profesional.`;

    const reportResponse = await this.chat.processChatForService(
      reportPrompt,
      'chat-general',
      `report_${issueKey}_${Date.now()}`,
      { isReportGeneration: true, originalIssueKey: issueKey }
    );

    if (!reportResponse.success) {
      throw new Error('Failed to generate report with AI');
    }

    const participants = [...new Set(history.map(msg => msg.role))];

    return {
      hasHistory: true,
      issueKey,
      report: reportResponse.response || '',
      messageCount: history.length,
      participants,
      conversationHistory: history,
      generatedAt: new Date().toISOString()
    };
  }
}
