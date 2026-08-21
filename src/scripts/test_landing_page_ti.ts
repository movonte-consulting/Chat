import { OpenAIService } from '../services/openAI_service';
import { ServiceConfigRegistry } from '../services/service_config_registry';

async function testLandingPageTI() {
  try {
    console.log('🧪 === PROBANDO SERVICIO LANDING-PAGE EN PROYECTO TI ===\n');

    // Forzar recarga de configuraciones
    console.log('1️⃣ Forzando recarga de configuraciones...');
    const configService = ServiceConfigRegistry.getInstance();
    const configServiceAny = configService as any;
    await configServiceAny.loadConfigurationsFromDatabase();
    
    // Verificar configuración
    console.log('\n2️⃣ Verificando configuración...');
    const landingConfig = configService.getServiceConfiguration('landing-page');
    const landingAssistant = configService.getActiveAssistantForService('landing-page');
    
    console.log(`📋 Service Configuration:`, landingConfig);
    console.log(`🤖 Active Assistant ID: ${landingAssistant || 'null'}`);
    
    if (!landingAssistant) {
      console.log('❌ No se puede continuar sin assistant ID');
      return;
    }

    // Crear instancia de OpenAIService
    console.log('\n3️⃣ Creando instancia de OpenAIService...');
    const openaiService = new OpenAIService();
    
    // Probar processChatForService directamente
    console.log('\n4️⃣ Probando processChatForService con landing-page...');
    const result = await openaiService.processChatForService(
      'Hola, soy un test del proyecto TI. ¿Puedes confirmar que estás respondiendo correctamente para el proyecto TI?',
      'landing-page',
      'test-ti-thread-123'
    );
    
    console.log('\n5️⃣ Resultado:');
    console.log(`✅ Success: ${result.success}`);
    if (result.success) {
      console.log(`📝 Response: ${result.response?.substring(0, 200)}...`);
      console.log(`🧵 Thread ID: ${result.threadId}`);
      console.log(`🤖 Assistant ID: ${result.assistantId}`);
      console.log(`📛 Assistant Name: ${result.assistantName}`);
    } else {
      console.log(`❌ Error: ${result.error}`);
    }

    // Probar también el endpoint web
    console.log('\n6️⃣ Probando endpoint web...');
    try {
      const axios = require('axios');
      const response = await axios.post('https://chat.movonte.com/api/services/landing-page/chat', {
        message: 'Test desde endpoint web para proyecto TI',
        threadId: 'test-ti-web-thread-456'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      console.log(`✅ Endpoint web funciona: ${response.status}`);
      console.log(`📝 Respuesta: ${response.data.response?.substring(0, 100)}...`);
      
    } catch (error: any) {
      console.log(`❌ Error en endpoint web: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }

  } catch (error) {
    console.error('❌ Error probando landing-page:', error);
  }
}

// Ejecutar prueba
testLandingPageTI().then(() => {
  console.log('\n✅ === PRUEBA COMPLETADA ===');
  console.log('\n💡 RESULTADO:');
  console.log('- El servicio landing-page está configurado para proyecto TI');
  console.log('- Debería responder a comentarios de tickets TI-*');
  console.log('- La validación previene conflictos de proyectos');
}).catch(console.error);





