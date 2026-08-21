#!/usr/bin/env node

/**
 * Script para probar la integración de ChatKit con Jira
 * Simula un webhook de Jira y verifica que ChatKit responda correctamente
 */

import { ChatKitJiraService } from '../services/chatkit_jira_service';
import { ServiceConfigRegistry } from '../services/service_config_registry';

async function testChatKitIntegration() {
  console.log('🧪 === PRUEBA DE INTEGRACIÓN CHATKIT ===\n');

  try {
    // Verificar configuración
    const configService = ServiceConfigRegistry.getInstance();
    const workflowId = process.env.OPENAI_CHATKIT_WORKFLOW_ID;
    
    if (!workflowId) {
      console.error('❌ OPENAI_CHATKIT_WORKFLOW_ID no está configurado');
      return;
    }

    console.log('✅ Configuración encontrada:');
    console.log(`   Workflow ID: ${workflowId}`);

    // Crear instancia del servicio
    const chatKitService = new ChatKitJiraService();
    console.log('✅ ChatKitJiraService creado');

    // Simular un comentario de Jira
    const testIssueKey = 'DEV-1';
    const testMessage = 'Hola, necesito ayuda con mi problema';
    const testAuthor = {
      displayName: 'Usuario Test',
      accountId: 'test-account-id',
      emailAddress: 'test@example.com'
    };

    console.log('\n📝 Simulando comentario de Jira:');
    console.log(`   Issue: ${testIssueKey}`);
    console.log(`   Mensaje: ${testMessage}`);
    console.log(`   Autor: ${testAuthor.displayName}`);

    // Procesar el comentario
    console.log('\n🔄 Procesando con ChatKit...');
    const startTime = Date.now();
    
    const response = await chatKitService.processJiraComment(
      testIssueKey,
      testMessage,
      testAuthor
    );

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('\n📊 Resultado:');
    console.log(`   Éxito: ${response.success}`);
    console.log(`   Duración: ${duration}ms`);
    
    if (response.success) {
      console.log(`   Session ID: ${response.sessionId}`);
      console.log(`   Respuesta: ${response.message?.substring(0, 100)}...`);
    } else {
      console.log(`   Error: ${response.error}`);
    }

    // Verificar si hay sesión activa
    console.log('\n🔍 Verificando sesión activa...');
    const hasSession = chatKitService.hasActiveSession(testIssueKey);
    console.log(`   Sesión activa para ${testIssueKey}: ${hasSession}`);

    if (hasSession) {
      const session = chatKitService.getActiveSession(testIssueKey);
      console.log(`   Session ID: ${session?.id}`);
      console.log(`   Expira: ${new Date(session?.expires_at || 0).toISOString()}`);
    }

    console.log('\n✅ Prueba completada exitosamente');

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error);
    process.exit(1);
  }
}

// Ejecutar la prueba
if (require.main === module) {
  testChatKitIntegration()
    .then(() => {
      console.log('\n🎉 Prueba finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

export { testChatKitIntegration };
