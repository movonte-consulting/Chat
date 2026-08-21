import { testConnection, syncDatabase } from '../config/database';
import { DatabaseService } from '../services/database_service';
import { ServiceConfigRegistry } from '../services/service_config_registry';

async function migrateToDatabase() {
  console.log('🔄 Iniciando migración a base de datos...');
  
  try {
    // Conectar a la base de datos
    console.log('🔌 Conectando a la base de datos...');
    const connected = await testConnection();
    
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos');
    }
    
    // Sincronizar modelos
    console.log('🔄 Sincronizando modelos...');
    await syncDatabase();
    
    const dbService = DatabaseService.getInstance();
    const configService = ServiceConfigRegistry.getInstance();
    
    // Migrar configuraciones de servicios
    console.log('📋 Migrando configuraciones de servicios...');
    const services = configService.getAllConfigurations();
    
    for (const service of services) {
      await dbService.createOrUpdateServiceConfig({
        serviceId: service.serviceId,
        serviceName: service.serviceName,
        assistantId: service.assistantId,
        assistantName: service.assistantName,
        isActive: service.isActive,
        lastUpdated: service.lastUpdated
      });
    }
    
    console.log(`✅ Migradas ${services.length} configuraciones de servicios`);
    
    // Obtener estadísticas de la base de datos
    const stats = await dbService.getDatabaseStats();
    console.log('\n📊 Estadísticas de la base de datos:');
    console.log(`   Total threads: ${stats.totalThreads}`);
    console.log(`   Total mensajes: ${stats.totalMessages}`);
    console.log(`   Total servicios: ${stats.totalServices}`);
    console.log(`   Threads activos (24h): ${stats.activeThreads}`);
    
    console.log('\n✅ Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateToDatabase();
}

export { migrateToDatabase };
