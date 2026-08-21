import { DatabaseService } from './database_service';
import { UserWebhook } from '../models';

interface UserWebhookConfiguration {
  id?: number;
  name: string;
  url: string;
  description?: string;
  isEnabled: boolean;
  filterEnabled: boolean;
  filterCondition?: string;
  filterValue?: string;
  webhookUrl?: string;
  lastTest?: string;
}

export class UserWebhookConfigRegistry {
  private static instances: Map<number, UserWebhookConfigRegistry> = new Map();
  private userId: number;
  private webhookConfig: UserWebhookConfiguration | null = null;
  private dbService: DatabaseService;

  private constructor(userId: number) {
    this.userId = userId;
    this.dbService = DatabaseService.getInstance();
    this.loadWebhookConfig();
  }

  public static getInstance(userId: number): UserWebhookConfigRegistry {
    if (!UserWebhookConfigRegistry.instances.has(userId)) {
      UserWebhookConfigRegistry.instances.set(userId, new UserWebhookConfigRegistry(userId));
    }
    return UserWebhookConfigRegistry.instances.get(userId)!;
  }

  private async loadWebhookConfig(): Promise<void> {
    try {
      const webhookConfig = await UserWebhook.findOne({
        where: { userId: this.userId, isEnabled: true }
      });

      if (webhookConfig) {
        this.webhookConfig = {
          id: webhookConfig.id,
          name: webhookConfig.name,
          url: webhookConfig.url,
          description: webhookConfig.description,
          isEnabled: webhookConfig.isEnabled,
          filterEnabled: webhookConfig.filterEnabled,
          filterCondition: webhookConfig.filterCondition,
          filterValue: webhookConfig.filterValue
        };
        console.log(`✅ Loaded webhook configuration for user ${this.userId}`);
      }
    } catch (error) {
      console.error(`❌ Error loading webhook configuration for user ${this.userId}:`, error);
    }
  }

  public async setWebhookConfiguration(config: UserWebhookConfiguration): Promise<void> {
    try {
      const webhookData = {
        userId: this.userId,
        name: config.name,
        url: config.url,
        description: config.description,
        isEnabled: config.isEnabled,
        filterEnabled: config.filterEnabled,
        filterCondition: config.filterCondition,
        filterValue: config.filterValue
      };

      if (config.id) {
        await UserWebhook.update(webhookData, {
          where: { id: config.id, userId: this.userId }
        });
      } else {
        await UserWebhook.create(webhookData);
      }

      this.webhookConfig = { ...config };
      console.log(`✅ Webhook configuration updated for user ${this.userId}`);
    } catch (error) {
      console.error(`❌ Error setting webhook configuration for user ${this.userId}:`, error);
      throw error;
    }
  }

  public getWebhookConfiguration(): UserWebhookConfiguration | null {
    return this.webhookConfig;
  }
}
