import { DatabaseService } from '../../../../services/database_service';
import { WebhookStatsPersistencePort } from '../../domain/interfaces/webhook-stats-persistence.port';

export class WebhookStatsPersistenceAdapter implements WebhookStatsPersistencePort {
  private readonly dbService = DatabaseService.getInstance();

  async recordResult(success: boolean): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingStats = await this.dbService.getWebhookStats(today);

      const totalWebhooks = (existingStats?.totalWebhooks || 0) + 1;
      const successfulResponses = (existingStats?.successfulResponses || 0) + (success ? 1 : 0);
      const failedResponses = (existingStats?.failedResponses || 0) + (success ? 0 : 1);

      await this.dbService.updateWebhookStats(today, totalWebhooks, successfulResponses, failedResponses);

      console.log(`📊 Webhook stats actualizadas: ${totalWebhooks} total, ${successfulResponses} exitosos, ${failedResponses} fallidos`);
    } catch (error) {
      console.error('❌ Error actualizando webhook stats:', error);
    }
  }
}
