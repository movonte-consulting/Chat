import { DatabaseService } from '../../../../services/database_service';
import { UserConfiguration } from '../../../../models';

interface UserServiceConfiguration {
  serviceId: string;
  serviceName: string;
  assistantId: string;
  assistantName: string;
  isActive: boolean;
  configuration?: any;
  lastUpdated: Date;
}

export class UserServiceConfigRegistry {
  private static instances: Map<number, UserServiceConfigRegistry> = new Map();
  private userId: number;
  private configurations: Map<string, UserServiceConfiguration> = new Map();
  private dbService: DatabaseService;

  private constructor(userId: number) {
    this.userId = userId;
    this.dbService = DatabaseService.getInstance();
    this.loadUserConfigurations();
  }

  public static getInstance(userId: number): UserServiceConfigRegistry {
    if (!UserServiceConfigRegistry.instances.has(userId)) {
      UserServiceConfigRegistry.instances.set(userId, new UserServiceConfigRegistry(userId));
    }
    return UserServiceConfigRegistry.instances.get(userId)!;
  }

  private async loadUserConfigurations(): Promise<void> {
    try {
      console.log(`🔄 Loading configurations for user ${this.userId}...`);

      const serviceConfigs = await UserConfiguration.findAll({
        where: { userId: this.userId }
      });

      this.configurations.clear();
      serviceConfigs.forEach(config => {
        this.configurations.set(config.serviceId, {
          serviceId: config.serviceId,
          serviceName: config.serviceName,
          assistantId: config.assistantId,
          assistantName: config.assistantName,
          isActive: config.isActive,
          configuration: config.configuration,
          lastUpdated: config.lastUpdated || config.updatedAt
        });
      });

      console.log(`✅ Loaded ${this.configurations.size} service configurations for user ${this.userId}`);
    } catch (error) {
      console.error(`❌ Error loading configurations for user ${this.userId}:`, error);
    }
  }

  public async setServiceConfiguration(
    serviceId: string,
    serviceName: string,
    assistantId: string,
    assistantName: string,
    isActive: boolean = true,
    configuration?: any
  ): Promise<void> {
    try {
      const configData = {
        serviceId,
        serviceName,
        assistantId,
        assistantName,
        isActive,
        configuration,
        lastUpdated: new Date()
      };

      await UserConfiguration.upsert({
        userId: this.userId,
        ...configData
      });

      this.configurations.set(serviceId, configData);
      console.log(`✅ Service configuration updated for user ${this.userId}: ${serviceId}`);
    } catch (error) {
      console.error(`❌ Error setting service configuration for user ${this.userId}:`, error);
      throw error;
    }
  }

  public getAllServiceConfigurations(): UserServiceConfiguration[] {
    return Array.from(this.configurations.values());
  }
}
