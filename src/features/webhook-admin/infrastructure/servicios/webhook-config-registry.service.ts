import { DatabaseService } from '../../../../services/database_service';

interface WebhookConfiguration {
  webhookUrl: string;
  isEnabled: boolean;
  lastUpdated: Date;
  filterEnabled: boolean;
  filterCondition: string;
  filterValue: string;
}

export class WebhookConfigRegistry {
  private static instance: WebhookConfigRegistry;
  private webhookConfig: WebhookConfiguration | null = null;
  private dbService: DatabaseService;

  private constructor() {
    this.dbService = DatabaseService.getInstance();
    this.loadWebhookConfig();
  }

  public static getInstance(): WebhookConfigRegistry {
    if (!WebhookConfigRegistry.instance) {
      WebhookConfigRegistry.instance = new WebhookConfigRegistry();
    }
    return WebhookConfigRegistry.instance;
  }

  // Cargar configuración del webhook desde la base de datos
  private async loadWebhookConfig(): Promise<void> {
    try {
      const config = await this.dbService.getWebhookConfig();
      if (config) {
        this.webhookConfig = {
          webhookUrl: config.webhookUrl || '',
          isEnabled: config.isEnabled,
          lastUpdated: config.lastUpdated,
          filterEnabled: config.filterEnabled,
          filterCondition: config.filterCondition,
          filterValue: config.filterValue
        };
        console.log(`✅ Webhook config loaded from database: ${config.webhookUrl ? 'URL set' : 'No URL'}, enabled: ${config.isEnabled}, filter: ${config.filterEnabled ? 'enabled' : 'disabled'}`);
      } else {
        console.log('⚠️ No webhook config found in database');
      }
    } catch (error) {
      console.error('❌ Error loading webhook config from database:', error);
    }
  }

  // Configurar webhook URL
  async setWebhookUrl(webhookUrl: string): Promise<void> {
    this.webhookConfig = {
      webhookUrl,
      isEnabled: true,
      lastUpdated: new Date(),
      filterEnabled: this.webhookConfig?.filterEnabled || false,
      filterCondition: this.webhookConfig?.filterCondition || 'response_value',
      filterValue: this.webhookConfig?.filterValue || 'Yes'
    };

    // Persistir en la base de datos
    await this.dbService.updateWebhookConfig(webhookUrl, true);
    console.log(`✅ Webhook URL configurada y persistida: ${webhookUrl}`);
  }

  // Obtener webhook URL
  getWebhookUrl(): string | null {
    return this.webhookConfig?.webhookUrl || null;
  }

  // Habilitar/deshabilitar webhook
  async setWebhookEnabled(isEnabled: boolean): Promise<void> {
    if (this.webhookConfig) {
      this.webhookConfig.isEnabled = isEnabled;
      this.webhookConfig.lastUpdated = new Date();

      // Persistir en la base de datos
      await this.dbService.updateWebhookConfig(this.webhookConfig.webhookUrl, isEnabled);
      console.log(`✅ Webhook ${isEnabled ? 'habilitado' : 'deshabilitado'} y persistido`);
    }
  }

  // Verificar si webhook está habilitado
  isWebhookEnabled(): boolean {
    return this.webhookConfig?.isEnabled || false;
  }

  // Obtener configuración completa del webhook
  getWebhookConfiguration(): WebhookConfiguration | null {
    return this.webhookConfig;
  }

  // Deshabilitar webhook (limpiar URL y deshabilitar)
  async disableWebhook(): Promise<void> {
    this.webhookConfig = {
      webhookUrl: '',
      isEnabled: false,
      lastUpdated: new Date(),
      filterEnabled: this.webhookConfig?.filterEnabled || false,
      filterCondition: this.webhookConfig?.filterCondition || 'response_value',
      filterValue: this.webhookConfig?.filterValue || 'Yes'
    };

    // Persistir en la base de datos
    await this.dbService.updateWebhookConfig(null, false);
    console.log(`✅ Webhook deshabilitado y persistido`);
  }

  // === WEBHOOK FILTER METHODS ===

  // Configurar filtro del webhook
  async setWebhookFilter(filterEnabled: boolean, filterCondition: string = 'response_value', filterValue: string = 'Yes'): Promise<void> {
    if (this.webhookConfig) {
      this.webhookConfig.filterEnabled = filterEnabled;
      this.webhookConfig.filterCondition = filterCondition;
      this.webhookConfig.filterValue = filterValue;
      this.webhookConfig.lastUpdated = new Date();
    }

    // Persistir en la base de datos
    await this.dbService.updateWebhookFilter(filterEnabled, filterCondition, filterValue);
    console.log(`✅ Webhook filter configurado y persistido: enabled=${filterEnabled}, condition=${filterCondition}, value=${filterValue}`);
  }

  // Verificar si el filtro está habilitado
  isWebhookFilterEnabled(): boolean {
    return this.webhookConfig?.filterEnabled || false;
  }

  // Obtener configuración del filtro
  getWebhookFilterConfig(): { filterEnabled: boolean; filterCondition: string; filterValue: string } | null {
    if (!this.webhookConfig) return null;

    return {
      filterEnabled: this.webhookConfig.filterEnabled,
      filterCondition: this.webhookConfig.filterCondition,
      filterValue: this.webhookConfig.filterValue
    };
  }

  // Verificar si la respuesta cumple con el filtro
  shouldSendWebhook(assistantResponse: any): boolean {
    console.log(`🔍 === WEBHOOK FILTER CHECK START ===`);
    console.log(`📋 Webhook config:`, {
      isEnabled: this.webhookConfig?.isEnabled,
      filterEnabled: this.webhookConfig?.filterEnabled,
      filterValue: this.webhookConfig?.filterValue
    });
    console.log(`📝 Assistant response:`, assistantResponse);

    if (!this.webhookConfig || !this.webhookConfig.isEnabled) {
      console.log(`❌ Webhook not enabled or not configured`);
      return false;
    }

    // Si el filtro está deshabilitado, enviar siempre
    if (!this.webhookConfig.filterEnabled) {
      console.log(`✅ Filter disabled, sending webhook`);
      return true;
    }

    // Extraer el valor del JSON de respuesta del asistente
    let responseValue = null;
    try {
      if (typeof assistantResponse === 'string') {
        const parsed = JSON.parse(assistantResponse);
        responseValue = parsed.value;
      } else if (typeof assistantResponse === 'object' && assistantResponse?.value) {
        responseValue = assistantResponse.value;
      }
    } catch (error) {
      console.log(`⚠️ Could not parse assistant response as JSON`);
    }

    console.log(`📝 Extracted response value: "${responseValue}"`);

    // LÓGICA: Solo enviar si el valor de la respuesta coincide con el filtro configurado
    const shouldSend = responseValue === this.webhookConfig.filterValue;

    console.log(`🔍 Filter logic: responseValue="${responseValue}", filterValue="${this.webhookConfig.filterValue}", shouldSend=${shouldSend}`);
    console.log(`🔍 === WEBHOOK FILTER CHECK END ===`);

    return shouldSend;
  }
}
