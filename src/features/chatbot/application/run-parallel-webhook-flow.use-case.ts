/**
 * Flujo paralelo de webhooks de escalación: si hay un asistente 'webhook-parallel' configurado,
 * lo corre con un thread separado y usa su respuesta; si no, reutiliza la respuesta del asistente
 * principal. Envía SIEMPRE (sin filtro real pese al nombre histórico "executeWebhookWithFilter")
 * a cada webhook de usuario habilitado para el servicio. Efectos secundarios únicamente — los
 * errores se registran y se tragan, igual que el bloque inline original en handleJiraWebhook.
 */

import { ChatbotUser } from '../domain/interfaces/chatbot-user-lookup.port';
import { ChatbotServiceConfigPort } from '../domain/interfaces/chatbot-service-config.port';
import { EscalationAssistantPort } from '../domain/interfaces/escalation-assistant.port';
import { UserWebhookLookupPort } from '../domain/interfaces/user-webhook-lookup.port';
import { UserWebhookDispatcherPort } from '../domain/interfaces/user-webhook-dispatcher.port';
import { UserServiceInfo } from '../domain/modelos/user-service-info.model';

export interface ParallelWebhookFlowInput {
  issueKey: string;
  userServiceInfo: UserServiceInfo;
  user: ChatbotUser;
  commentMessage: string;
  authorName: string;
  issue: any;
  comment: any;
  issueSummary?: string;
  issueStatus?: string;
  mainResponseText: string;
}

export class RunParallelWebhookFlowUseCase {
  constructor(
    private readonly userWebhookLookup: UserWebhookLookupPort,
    private readonly serviceConfig: ChatbotServiceConfigPort,
    private readonly escalationAssistant: EscalationAssistantPort,
    private readonly userWebhookDispatcher: UserWebhookDispatcherPort
  ) {}

  async execute(input: ParallelWebhookFlowInput): Promise<void> {
    const { issueKey, userServiceInfo, user, commentMessage, authorName, issue, comment, issueSummary, issueStatus, mainResponseText } = input;

    try {
      console.log(`🚀 Iniciando flujo paralelo de webhook para ${issueKey}...`);

      const userWebhooks = await this.userWebhookLookup.findEnabled(user.id, userServiceInfo.serviceId);
      if (!userWebhooks || userWebhooks.length === 0) {
        console.log(`⚠️ No hay webhooks configurados para el usuario ${user.id} y servicio ${userServiceInfo.serviceId}, saltando envío paralelo`);
        return;
      }

      console.log(`✅ Encontrados ${userWebhooks.length} webhook(s) activo(s) para el usuario ${user.id} y servicio ${userServiceInfo.serviceId}`);

      const webhookThreadId = `thread_webhook_${issueKey}_${Date.now()}`;

      const webhookContext = {
        jiraIssueKey: issueKey,
        issueSummary,
        issueStatus,
        authorName,
        userId: user.id,
        serviceId: userServiceInfo.serviceId,
        issue,
        comment,
        conversationHistory: [] as any[],
        previousResponses: [] as any[],
        timestamp: new Date().toISOString()
      };

      const landingAssistantId = this.serviceConfig.getActiveAssistantForService('landing-page');
      const webhookAssistantId = this.serviceConfig.getActiveAssistantForService('webhook-parallel');

      let responseToSend = mainResponseText;

      if (webhookAssistantId && user.openaiToken) {
        console.log(`🤖 PROCESANDO CON ASISTENTE DE ESCALACIÓN: ${webhookAssistantId}`);
        const escalationResult = await this.escalationAssistant.run(user.openaiToken, webhookAssistantId, commentMessage, issueKey);

        if (!escalationResult.response) {
          console.log(`⚠️ NO HAY RESPUESTA DEL ASISTENTE DE ESCALACIÓN`);
          return;
        }
        responseToSend = escalationResult.response;
      } else {
        console.log(`📡 REUTILIZANDO RESPUESTA DEL FLUJO PRINCIPAL PARA WEBHOOK`);
      }

      for (const webhook of userWebhooks) {
        try {
          console.log(`✅ Enviando a webhook ${webhook.id} (${webhook.name}) - SIEMPRE enviar`);
          await this.userWebhookDispatcher.dispatch(webhook, {
            userId: webhookContext.userId,
            serviceId: webhookContext.serviceId,
            issueKey,
            authorName: webhookContext.authorName,
            originalMessage: commentMessage,
            timestamp: webhookContext.timestamp,
            issue: webhookContext.issue,
            comment: webhookContext.comment,
            assistantResponse: responseToSend,
            jiraIssueKey: webhookContext.jiraIssueKey,
            issueSummary: webhookContext.issueSummary,
            issueStatus: webhookContext.issueStatus,
            conversationHistory: webhookContext.conversationHistory,
            previousResponses: webhookContext.previousResponses
          });
        } catch (error) {
          console.error(`❌ Error ejecutando webhook ${webhook.id}:`, error);
        }
      }

      console.log(`✅ Flujo paralelo de webhook completado para ${issueKey}`);
    } catch (webhookError) {
      console.error('❌ Error ejecutando webhooks paralelos:', webhookError);
    }
  }
}
