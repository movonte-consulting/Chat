import { DatabaseService } from './database_service';

interface ServiceConfiguration {
  serviceId: string;
  serviceName: string;
  assistantId: string;
  assistantName: string;
  isActive: boolean;
  lastUpdated: Date;
}

export class ServiceConfigRegistry {
  private static instance: ServiceConfigRegistry;
  private configurations: Map<string, ServiceConfiguration> = new Map();
  private readonly CONFIG_FILE = 'service-config.json';
  private dbService: DatabaseService;

  private constructor() {
    this.dbService = DatabaseService.getInstance();
    this.loadConfigurations();
    this.loadConfigurationsFromDatabase();
  }

  public static getInstance(): ServiceConfigRegistry {
    if (!ServiceConfigRegistry.instance) {
      ServiceConfigRegistry.instance = new ServiceConfigRegistry();
    }
    return ServiceConfigRegistry.instance;
  }

  // Cargar configuraciones desde archivo
  private loadConfigurations(): void {
    try {
      // Por ahora usamos configuraciones por defecto
      // En producción esto se cargaría desde una base de datos o archivo
      this.configurations.set('landing-page', {
        serviceId: 'landing-page',
        serviceName: 'Landing Page',
        assistantId: process.env.OPENAI_ASSISTANT_ID || '',
        assistantName: 'AI Assistant Chat',
        isActive: true,
        lastUpdated: new Date()
      });

      this.configurations.set('jira-integration', {
        serviceId: 'jira-integration',
        serviceName: 'Integración Jira',
        assistantId: process.env.OPENAI_ASSISTANT_ID || '',
        assistantName: 'AI Assistant Chat',
        isActive: false, // DISABLED - Only use landing-page assistant
        lastUpdated: new Date()
      });

      this.configurations.set('chat-general', {
        serviceId: 'chat-general',
        serviceName: 'Chat General',
        assistantId: process.env.OPENAI_ASSISTANT_ID || '',
        assistantName: 'AI Assistant Chat',
        isActive: false, // DISABLED - Only use landing-page assistant
        lastUpdated: new Date()
      });

      this.configurations.set('general-chat', {
        serviceId: 'general-chat',
        serviceName: 'Chat General',
        assistantId: process.env.OPENAI_ASSISTANT_ID || '',
        assistantName: ' AI Assistant Chat',
        isActive: false, // DISABLED - Only use landing-page assistant
        lastUpdated: new Date()
      });

      this.configurations.set('webhook-parallel', {
        serviceId: 'webhook-parallel',
        serviceName: 'Webhook Parallel Flow',
        assistantId: process.env.OPENAI_ASSISTANT_ID || '',
        assistantName: 'AI Assistant Chat',
        isActive: false, // DISABLED by default - needs to be configured
        lastUpdated: new Date()
      });

      console.log('✅ Configuraciones de servicio cargadas');
    } catch (error) {
      console.error('❌ Error cargando configuraciones:', error);
    }
  }

  // Cargar configuraciones desde base de datos
  private async loadConfigurationsFromDatabase(): Promise<void> {
    try {
      console.log('🔄 Cargando configuraciones desde base de datos...');
      const dbConfigs = await this.dbService.getAllServiceConfigs();

      if (dbConfigs.length > 0) {
        console.log(`📋 Encontradas ${dbConfigs.length} configuraciones en BD`);

        // Actualizar configuraciones con datos de BD
        for (const dbConfig of dbConfigs) {
          // Filtrar configuraciones especiales que no son servicios reales
          if (dbConfig.serviceId.startsWith('disabled_ticket_') ||
              dbConfig.serviceId === 'status-based-disable') {
            continue;
          }

          console.log(`🔍 Procesando configuración de BD: ${dbConfig.serviceId} -> ${dbConfig.assistantName} (${dbConfig.assistantId})`);

          // SIEMPRE usar la configuración de BD si existe (excepto para configuraciones especiales)
          this.configurations.set(dbConfig.serviceId, {
            serviceId: dbConfig.serviceId,
            serviceName: dbConfig.serviceName,
            assistantId: dbConfig.assistantId,
            assistantName: dbConfig.assistantName,
            isActive: dbConfig.isActive,
            lastUpdated: dbConfig.lastUpdated || new Date()
          });

          console.log(`✅ Configuración actualizada desde BD: ${dbConfig.serviceName} -> ${dbConfig.assistantName} (Activo: ${dbConfig.isActive})`);
        }

        // Log del estado final de configuraciones
        console.log(`🔍 Estado final de configuraciones después de cargar BD:`);
        for (const [id, cfg] of this.configurations.entries()) {
          console.log(`  - ${id}: ${cfg.assistantName} (${cfg.assistantId}) - Activo: ${cfg.isActive}`);
        }
      } else {
        console.log('⚠️ No se encontraron configuraciones en BD, usando configuraciones por defecto');
      }
    } catch (error) {
      console.error('❌ Error cargando configuraciones desde BD:', error);
    }
  }

  // Obtener configuración de un servicio específico
  getServiceConfiguration(serviceId: string): ServiceConfiguration | null {
    return this.configurations.get(serviceId) || null;
  }

  // Obtener todas las configuraciones (excluyendo servicios de chat global)
  getAllConfigurations(): ServiceConfiguration[] {
    const allConfigs = Array.from(this.configurations.values());

    // Filtrar servicios de chat global
    const filteredConfigs = allConfigs.filter(config => {
      const isChatGlobal = config.serviceId === 'chat-general' ||
                          config.serviceId === 'general-chat' ||
                          config.serviceName.toLowerCase().includes('chat general');

      return !isChatGlobal;
    });

    console.log('🔍 Filtered configurations (removed chat global):', filteredConfigs.length);
    return filteredConfigs;
  }

  // Actualizar configuración de un servicio
  async updateServiceConfiguration(serviceId: string, assistantId: string, assistantName: string): Promise<boolean> {
    try {
      console.log(`🔧 Actualizando configuración para servicio: ${serviceId}`);
      console.log(`📊 Asistente: ${assistantName} (${assistantId})`);

      const config = this.configurations.get(serviceId);
      if (config) {
        console.log(`📋 Configuración anterior: ${config.assistantName} (${config.assistantId})`);

        config.assistantId = assistantId;
        config.assistantName = assistantName;
        config.lastUpdated = new Date();
        this.configurations.set(serviceId, config);

        // Guardar en base de datos
        await this.dbService.createOrUpdateServiceConfig({
          serviceId: config.serviceId,
          serviceName: config.serviceName,
          assistantId: assistantId,
          assistantName: assistantName,
          isActive: config.isActive,
          lastUpdated: config.lastUpdated
        });

        console.log(`✅ Configuración actualizada para ${serviceId}: ${assistantName} - Guardado en BD`);

        // Log de todas las configuraciones para debug
        console.log(`🔍 Estado actual de configuraciones:`);
        for (const [id, cfg] of this.configurations.entries()) {
          console.log(`  - ${id}: ${cfg.assistantName} (${cfg.assistantId}) - Activo: ${cfg.isActive}`);
        }

        // Verificar específicamente webhook-parallel después de actualizar landing-page
        if (serviceId === 'landing-page') {
          const webhookConfig = this.configurations.get('webhook-parallel');
          console.log(`🔍 Estado de webhook-parallel después de actualizar landing-page:`, webhookConfig);

          // Asegurar que webhook-parallel mantenga su configuración si está activo
          if (webhookConfig && webhookConfig.isActive && webhookConfig.assistantId !== process.env.OPENAI_ASSISTANT_ID) {
            console.log(`🔒 Manteniendo configuración webhook-parallel independiente: ${webhookConfig.assistantName}`);
          }
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error actualizando configuración:', error);
      return false;
    }
  }

  // Obtener asistente activo para un servicio
  getActiveAssistantForService(serviceId: string): string | null {
    const config = this.configurations.get(serviceId);
    return config && config.isActive ? config.assistantId : null;
  }

  // Activar/desactivar un servicio
  toggleService(serviceId: string, isActive: boolean): boolean {
    const config = this.configurations.get(serviceId);
    if (config) {
      config.isActive = isActive;
      config.lastUpdated = new Date();
      this.configurations.set(serviceId, config);
      return true;
    }
    return false;
  }

  // Verificar si un servicio está activo
  isServiceActive(serviceId: string): boolean {
    const config = this.configurations.get(serviceId);
    return config ? config.isActive : false;
  }

  // Agregar nuevo servicio
  addService(serviceId: string, serviceName: string, assistantId: string, assistantName: string): boolean {
    try {
      const newConfig: ServiceConfiguration = {
        serviceId,
        serviceName,
        assistantId,
        assistantName,
        isActive: true,
        lastUpdated: new Date()
      };

      this.configurations.set(serviceId, newConfig);
      console.log(`✅ Nuevo servicio agregado: ${serviceName}`);
      return true;
    } catch (error) {
      console.error('❌ Error agregando servicio:', error);
      return false;
    }
  }

  // Eliminar servicio
  removeService(serviceId: string): boolean {
    try {
      const removed = this.configurations.delete(serviceId);
      if (removed) {
        console.log(`✅ Servicio eliminado: ${serviceId}`);
      }
      return removed;
    } catch (error) {
      console.error('❌ Error eliminando servicio:', error);
      return false;
    }
  }
}
