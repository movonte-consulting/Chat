import { ServiceConfigRegistry } from '../services/service_config_registry';
import { DatabaseService } from '../services/database_service';

async function debugConfiguration() {
  console.log('🔍 === DEBUGGING CONFIGURATION ===\n');
  
  const configService = ServiceConfigRegistry.getInstance();
  const dbService = DatabaseService.getInstance();
  
  // Esperar a que las configuraciones se carguen completamente
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 1. Verificar configuración en base de datos PRIMERO
  console.log('💾 1. CONFIGURACIÓN EN BASE DE DATOS:');
  try {
    const dbConfigs = await dbService.getAllServiceConfigs();
    console.log(`   - Total configs in DB: ${dbConfigs.length}`);
    dbConfigs
      .filter(config => !config.serviceId.startsWith('disabled_ticket_') && config.serviceId !== 'status-based-disable')
      .forEach(config => {
        console.log(`   - ${config.serviceId}: ${config.assistantName} (${config.assistantId}) - Activo: ${config.isActive}`);
      });
  } catch (error) {
    console.log(`   ❌ Error reading from database: ${error}`);
  }
  
  // 2. Verificar configuración en memoria DESPUÉS
  console.log('\n📋 2. CONFIGURACIÓN EN MEMORIA (DESPUÉS DE CARGAR BD):');
  const allConfigs = configService.getAllConfigurations();
  allConfigs.forEach(config => {
    console.log(`   - ${config.serviceId}: ${config.assistantName} (${config.assistantId}) - Activo: ${config.isActive}`);
  });
  
  // 3. Verificar configuración específica de landing-page
  console.log('\n🎯 3. CONFIGURACIÓN LANDING-PAGE EN MEMORIA:');
  const landingConfig = configService.getServiceConfiguration('landing-page');
  if (landingConfig) {
    console.log(`   - Assistant ID: ${landingConfig.assistantId}`);
    console.log(`   - Assistant Name: ${landingConfig.assistantName}`);
    console.log(`   - Is Active: ${landingConfig.isActive}`);
    console.log(`   - Last Updated: ${landingConfig.lastUpdated}`);
  } else {
    console.log('   ❌ No configuration found for landing-page');
  }
  
  // 4. Verificar asistente activo para landing-page
  console.log('\n🤖 4. ASISTENTE ACTIVO PARA LANDING-PAGE:');
  const activeAssistant = configService.getActiveAssistantForService('landing-page');
  console.log(`   - Active Assistant ID: ${activeAssistant || 'NO CONFIGURADO'}`);
  
  // 5. Verificar configuración específica de webhook-parallel
  console.log('\n🎯 5. CONFIGURACIÓN WEBHOOK-PARALLEL EN MEMORIA:');
  const webhookConfig = configService.getServiceConfiguration('webhook-parallel');
  if (webhookConfig) {
    console.log(`   - Assistant ID: ${webhookConfig.assistantId}`);
    console.log(`   - Assistant Name: ${webhookConfig.assistantName}`);
    console.log(`   - Is Active: ${webhookConfig.isActive}`);
    console.log(`   - Last Updated: ${webhookConfig.lastUpdated}`);
  } else {
    console.log('   ❌ No configuration found for webhook-parallel');
  }
  
  // 6. Verificar asistente activo para webhook-parallel
  console.log('\n🤖 6. ASISTENTE ACTIVO PARA WEBHOOK-PARALLEL:');
  const webhookActiveAssistant = configService.getActiveAssistantForService('webhook-parallel');
  console.log(`   - Active Assistant ID: ${webhookActiveAssistant || 'NO CONFIGURADO'}`);
  
  console.log('\n✅ Debug completed');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  debugConfiguration().catch(console.error);
}

export { debugConfiguration };


