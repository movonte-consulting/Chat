import { ServiceConfigRegistry } from '../services/service_config_registry';

async function forceReloadConfigurations() {
  try {
    console.log('🔄 === FORZANDO RECARGA DE CONFIGURACIONES ===\n');

    const configService = ServiceConfigRegistry.getInstance();
    
    // Acceder al método privado usando any
    const configServiceAny = configService as any;
    
    console.log('1️⃣ Recargando configuraciones desde base de datos...');
    await configServiceAny.loadConfigurationsFromDatabase();
    
    console.log('\n2️⃣ Verificando configuración del servicio BDM...');
    const bdmConfig = configService.getServiceConfiguration('bdm-service');
    const bdmAssistant = configService.getActiveAssistantForService('bdm-service');
    
    console.log(`📋 Service Configuration:`, bdmConfig);
    console.log(`🤖 Active Assistant ID: ${bdmAssistant || 'null'}`);
    
    // Verificar el Map directamente
    console.log('\n3️⃣ Verificando Map de configuraciones...');
    const configurationsMap = configServiceAny.configurations;
    console.log(`   Tamaño del Map: ${configurationsMap.size}`);
    
    const bdmFromMap = configurationsMap.get('bdm-service');
    if (bdmFromMap) {
      console.log('✅ bdm-service encontrado en Map:');
      console.log(`   Service ID: ${bdmFromMap.serviceId}`);
      console.log(`   Assistant ID: ${bdmFromMap.assistantId}`);
      console.log(`   Is Active: ${bdmFromMap.isActive}`);
    } else {
      console.log('❌ bdm-service NO encontrado en Map');
    }
    
    // Listar todas las configuraciones en el Map
    console.log('\n4️⃣ Todas las configuraciones en el Map:');
    for (const [serviceId, config] of configurationsMap.entries()) {
      console.log(`   - ${serviceId}: ${config.isActive ? 'Activo' : 'Inactivo'} | Assistant: ${config.assistantId || 'No configurado'}`);
    }

  } catch (error) {
    console.error('❌ Error forzando recarga:', error);
  }
}

// Ejecutar
forceReloadConfigurations().then(() => {
  console.log('\n✅ === RECARGA COMPLETADA ===');
}).catch(console.error);






