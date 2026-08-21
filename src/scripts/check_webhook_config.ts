import { ServiceConfigRegistry } from '../services/service_config_registry';
import { WebhookConfigRegistry } from '../features/webhook-admin/infrastructure/servicios/webhook-config-registry.service';

async function checkWebhookConfig() {
  try {
    console.log('🔍 Checking webhook configuration...');

    const serviceConfig = ServiceConfigRegistry.getInstance();
    const webhookConfigRegistry = WebhookConfigRegistry.getInstance();

    // Verificar configuración del webhook
    const webhookConfig = webhookConfigRegistry.getWebhookConfiguration();
    console.log('📋 Webhook Configuration:', webhookConfig);

    // Verificar configuración del servicio webhook-parallel
    const webhookServiceConfig = serviceConfig.getServiceConfiguration('webhook-parallel');
    console.log('📋 Webhook Service Configuration:', webhookServiceConfig);

    // Verificar si el servicio está activo
    const isWebhookActive = serviceConfig.isServiceActive('webhook-parallel');
    console.log('📋 Is Webhook Service Active:', isWebhookActive);

    // Verificar asistente activo para webhook-parallel
    const webhookAssistantId = serviceConfig.getActiveAssistantForService('webhook-parallel');
    console.log('📋 Webhook Assistant ID:', webhookAssistantId);

    // Verificar asistente activo para landing-page
    const landingAssistantId = serviceConfig.getActiveAssistantForService('landing-page');
    console.log('📋 Landing Page Assistant ID:', landingAssistantId);

    // Verificar configuración del filtro
    const filterConfig = webhookConfigRegistry.getWebhookFilterConfig();
    console.log('📋 Filter Configuration:', filterConfig);

    // Verificar configuraciones específicas
    console.log('\n📋 Specific Service Configurations:');
    const services = ['landing-page', 'webhook-parallel', 'general-chat'];
    services.forEach(serviceId => {
      const config = serviceConfig.getServiceConfiguration(serviceId);
      if (config) {
        console.log(`  - ${serviceId}: ${config.assistantName} (${config.assistantId}) - Active: ${config.isActive}`);
      } else {
        console.log(`  - ${serviceId}: NOT CONFIGURED`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking webhook config:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkWebhookConfig();
}

export { checkWebhookConfig };
