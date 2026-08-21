import { ServiceConfigRegistry } from '../services/service_config_registry';
import { OpenAIService } from '../services/openAI_service';

async function forceReloadServerConfig() {
  try {
    console.log('🔄 === FORZANDO RECARGA DE CONFIGURACIONES DEL SERVIDOR ===\n');

    // 1. Forzar recarga de ConfigurationService
    console.log('1️⃣ Forzando recarga de ConfigurationService...');
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
      'Test de verificación: ¿eres chatbot test V2?',
      'landing-page',
      'test-v2-verification-123'
    );
    
    console.log('\n4️⃣ Resultado:');
    console.log(`✅ Success: ${result.success}`);
    if (result.success) {
      console.log(`📝 Response: ${result.response?.substring(0, 200)}...`);
      console.log(`🤖 Assistant ID: ${result.assistantId}`);
      console.log(`📛 Assistant Name: ${result.assistantName}`);
      
      // Verificar si es el asistente correcto
      if (result.assistantId === 'asst_8ttQDMww5jd42tqe4nZ7JjG0') {
        console.log('✅ CORRECTO: Usando chatbot test V2');
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
        message: 'Test web: ¿eres chatbot test V2?',
        threadId: 'test-v2-web-456'
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
    console.error('❌ Error forzando recarga:', error);
  }
}

// Ejecutar
forceReloadServerConfig().then(() => {
  console.log('\n✅ === RECARGA COMPLETADA ===');
  console.log('\n💡 RESULTADO:');
  console.log('- Las configuraciones han sido recargadas');
  console.log('- El servidor debería usar chatbot test V2 ahora');
  console.log('- Prueba el webhook nuevamente');
}).catch(console.error);





