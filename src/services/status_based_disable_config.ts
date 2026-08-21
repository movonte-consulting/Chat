import { DatabaseService } from './database_service';
import { TicketDisableRegistry } from './ticket_disable_registry';

interface StatusBasedDisableConfig {
  isEnabled: boolean;
  triggerStatuses: string[];
  lastUpdated: Date;
}

export class StatusBasedDisableConfigService {
  private static instance: StatusBasedDisableConfigService;
  private statusBasedDisableConfig: StatusBasedDisableConfig = {
    isEnabled: false,
    triggerStatuses: [],
    lastUpdated: new Date()
  };
  private dbService: DatabaseService;
  private ticketDisableRegistry: TicketDisableRegistry;

  private constructor() {
    this.dbService = DatabaseService.getInstance();
    this.ticketDisableRegistry = TicketDisableRegistry.getInstance();
    this.loadStatusBasedDisableConfig();
  }

  public static getInstance(): StatusBasedDisableConfigService {
    if (!StatusBasedDisableConfigService.instance) {
      StatusBasedDisableConfigService.instance = new StatusBasedDisableConfigService();
    }
    return StatusBasedDisableConfigService.instance;
  }

  // Configurar deshabilitación basada en estados
  async setStatusBasedDisableConfig(isEnabled: boolean, triggerStatuses: string[]): Promise<void> {
    console.log(`🔧 Setting status-based disable config:`, {
      isEnabled,
      triggerStatuses,
      triggerStatusesType: typeof triggerStatuses,
      isArray: Array.isArray(triggerStatuses)
    });

    this.statusBasedDisableConfig = {
      isEnabled,
      triggerStatuses,
      lastUpdated: new Date()
    };

    // Persistir en base de datos
    try {
      await this.dbService.createOrUpdateServiceConfig({
        serviceId: 'status-based-disable',
        serviceName: 'Status-Based Disable Config',
        assistantId: isEnabled ? 'ENABLED' : 'DISABLED',
        assistantName: `Trigger Statuses: ${triggerStatuses.join(', ')}`,
        isActive: true,
        lastUpdated: new Date()
      });
      console.log(`✅ Status-based disable config saved to database`);
    } catch (error) {
      console.error('❌ Error saving status-based disable config to database:', error);
    }

    console.log(`✅ Status-based disable config updated:`, {
      isEnabled,
      triggerStatuses,
      lastUpdated: this.statusBasedDisableConfig.lastUpdated
    });
  }

  // Obtener configuración de deshabilitación basada en estados
  getStatusBasedDisableConfig(): StatusBasedDisableConfig {
    console.log(`🔍 Getting status-based disable config:`, this.statusBasedDisableConfig);
    return this.statusBasedDisableConfig;
  }

  // Cargar configuración de deshabilitación basada en estados desde la base de datos
  private async loadStatusBasedDisableConfig(): Promise<void> {
    try {
      const config = await this.dbService.getServiceConfig('status-based-disable');
      if (config) {
        const isEnabled = config.assistantId === 'ENABLED';
        const triggerStatuses = config.assistantName.includes('Trigger Statuses: ')
          ? config.assistantName.replace('Trigger Statuses: ', '').split(', ').filter((s: string) => s.trim())
          : [];

        this.statusBasedDisableConfig = {
          isEnabled,
          triggerStatuses,
          lastUpdated: config.lastUpdated || new Date()
        };

        console.log(`✅ Status-based disable config loaded from database:`, this.statusBasedDisableConfig);
      }
    } catch (error) {
      console.error('❌ Error loading status-based disable config from database:', error);
    }
  }

  // Verificar si un estado debe deshabilitar la IA
  shouldDisableForStatus(status: string): boolean {
    if (!this.statusBasedDisableConfig.isEnabled) {
      return false;
    }
    return this.statusBasedDisableConfig.triggerStatuses.includes(status);
  }

  // Verificar si un ticket debe ser deshabilitado por cambio de estado
  async checkAndHandleStatusChange(issueKey: string, newStatus: string): Promise<boolean> {
    const wasDisabled = this.ticketDisableRegistry.isTicketDisabled(issueKey);
    const shouldDisable = this.shouldDisableForStatus(newStatus);

    if (shouldDisable && !wasDisabled) {
      // Deshabilitar por cambio de estado
      await this.ticketDisableRegistry.disableAssistantForTicket(
        issueKey,
        `Auto-disabled: Status changed to "${newStatus}"`
      );
      console.log(`🚫 Auto-disabled AI for ticket ${issueKey} due to status change to "${newStatus}"`);
      return true;
    } else if (!shouldDisable && wasDisabled) {
      // Verificar si fue deshabilitado por cambio de estado
      const ticketInfo = this.ticketDisableRegistry.getDisabledTicketInfo(issueKey);
      if (ticketInfo?.reason?.includes('Auto-disabled: Status changed to')) {
        // Reactivar automáticamente
        await this.ticketDisableRegistry.enableAssistantForTicket(issueKey);
        console.log(`✅ Auto-re-enabled AI for ticket ${issueKey} due to status change from "${newStatus}"`);
        return true;
      }
    }

    return false;
  }
}
