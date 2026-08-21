import { OpenAIService } from '../services/openAI_service';
import { ServiceConfigRegistry } from '../services/service_config_registry';

async function testAssistantV3() {
  try {
    console.log('🧪 === PROBANDO CHATBOT TEST V3 ===\n');

    // 1. Forzar recarga de configuraciones
    console.log('1️⃣ Forzando recarga de configuraciones...');
    const configService = ServiceConfigRegistry.getInstance();
    const configServiceAny = configService as any;
    await configServiceAny.loadConfigurationsFromDatabase();
    
    // Verificar configuración
    console.log('\n2️⃣ Verificando configuración actualizada...');
    const landingConfig = configService.getServiceConfiguration('landing-page');
    const landingAssistant = configService.getActiveAssistantForService('landing-page');
    
    console.log(`📋 Service Configuration:`, landingConfig);
    console.log(`🤖 Active Assistant ID: ${landingAssistant || 'null'}`);
    
    if (!landingAssistant) {
      console.log('❌ No se puede continuar sin assistant ID');
      return;
    }

    // 2. Probar con OpenAIService
    console.log('\n3️⃣ Probando con OpenAIService...');
    const openaiService = new OpenAIService();
    
    const result = await openaiService.processChatForService(
      'Test de verificación: ¿eres chatbot test V3?',
      'landing-page',
      'test-v3-verification-123'
    );
    
    console.log('\n4️⃣ Resultado:');
    console.log(`✅ Success: ${result.success}`);
    if (result.success) {
      console.log(`📝 Response: ${result.response?.substring(0, 200)}...`);
      console.log(`🤖 Assistant ID: ${result.assistantId}`);
      console.log(`📛 Assistant Name: ${result.assistantName}`);
      
      // Verificar si es el asistente correcto
      if (result.assistantId === 'asst_UV1zfpkWRdj3ErxLzl7aDlxc') {
        console.log('✅ CORRECTO: Usando chatbot test V3');
      } else {
        console.log('❌ INCORRECTO: Aún usando asistente viejo');
      }
    } else {
      console.log(`❌ Error: ${result.error}`);
    }

    // 3. Probar endpoint web
    console.log('\n5️⃣ Probando endpoint web...');
    try {
      const axios = require('axios');
      const response = await axios.post('https://chat.movonte.com/api/services/landing-page/chat', {
        message: 'Test web: ¿eres chatbot test V3?',
        threadId: 'test-v3-web-456'
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
    console.error('❌ Error probando asistente V3:', error);
  }
}

// Ejecutar
testAssistantV3().then(() => {
  console.log('\n✅ === PRUEBA COMPLETADA ===');
  console.log('\n💡 RESULTADO:');
  console.log('- El sistema debería usar chatbot test V3 ahora');
  console.log('- Prueba el webhook nuevamente');
  console.log('- Debería responder con el asistente V3');
}).catch(console.error);





