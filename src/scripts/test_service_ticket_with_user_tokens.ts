import { ticketController } from '../features/tickets/infrastructure/dependency-injection';
import { User } from '../models';

async function testServiceTicketWithUserTokens() {
  console.log('🧪 === TESTING SERVICE TICKET WITH USER TOKENS ===\n');

  try {
    const controller = ticketController;

    // 1. Buscar un usuario con tokens de Jira configurados
    console.log('1️⃣ Buscando usuario con tokens de Jira...');
    
    const user = await User.findOne({
      where: {
        jiraToken: { [require('sequelize').Op.ne]: null },
        jiraUrl: { [require('sequelize').Op.ne]: null }
      }
    });

    if (!user) {
      console.log('❌ No se encontró usuario con tokens de Jira configurados');
      console.log('💡 Configurando usuario de prueba...');
      
      // Crear o actualizar usuario de prueba
      const testUser = await User.upsert({
        id: 12,
        username: 'testuser',
        email: 'test@movonte.com',
        password: 'hashedpassword',
        role: 'user',
        isActive: true,
        jiraToken: 'ATATT3xFfGF0jD3lk0buhOKqcJLQOPUeKZ6GmlB5za3uOibZFrDj5-3u-316dcgY_eawL4_rpqf7U1oEGzwOZIG_DQCjw8wCqsPEHU_LcYYM1R-qUzpsRA_y5FBFb9jE3uy8maIkefO0yJgShhQYIppgdxMRfQW__UNzGt0nVky0N4Li_BRzKXY=E39EBDA',
        jiraUrl: 'https://movonte.atlassian.net',
        isInitialSetupComplete: true
      });

      console.log('✅ Usuario de prueba configurado:', testUser[0].id);
    } else {
      console.log('✅ Usuario encontrado:', user.id, user.email);
    }

    // 2. Verificar configuración del servicio
    console.log('\n2️⃣ Verificando configuración del servicio...');
    
    const { sequelize } = await import('../config/database');
    const [services] = await sequelize.query(`
      SELECT * FROM unified_configurations 
      WHERE service_id = 'hpla' AND is_active = TRUE
      LIMIT 1
    `);

    if (!services || (services as any[]).length === 0) {
      console.log('💡 Creando configuración de servicio...');
      
      await sequelize.query(`
        INSERT INTO unified_configurations 
        (service_id, service_name, user_id, assistant_id, assistant_name, is_active, configuration, created_at, updated_at)
        VALUES 
        ('hpla', 'Servicio HPLA', 12, 'asst_test', 'Asistente HPLA', TRUE, 
         '{"projectKey": "SCRUM", "adminApproved": true, "adminApprovedAt": "2025-10-23T17:10:32.780Z"}',
         NOW(), NOW())
        ON DUPLICATE KEY UPDATE
        is_active = TRUE,
        configuration = '{"projectKey": "SCRUM", "adminApproved": true, "adminApprovedAt": "2025-10-23T17:10:32.780Z"}',
        updated_at = NOW()
      `);
      
      console.log('✅ Configuración de servicio creada');
    } else {
      console.log('✅ Servicio encontrado:', (services as any[])[0]);
    }

    // 3. Probar creación de ticket con usuario autenticado
    console.log('\n3️⃣ Probando createTicketForService con usuario autenticado...');
    
    const mockReq = {
      body: {
        customerInfo: {
          name: 'Usuario Test',
          email: 'test@example.com',
          company: 'Test Company',
          message: 'Mensaje de prueba con tokens de usuario'
        },
        serviceId: 'hpla'
      },
      user: {
        id: 12,
        username: 'testuser',
        email: 'test@movonte.com',
        role: 'user',
        jiraToken: 'ATATT3xFfGF0jD3lk0buhOKqcJLQOPUeKZ6GmlB5za3uOibZFrDj5-3u-316dcgY_eawL4_rpqf7U1oEGzwOZIG_DQCjw8wCqsPEHU_LcYYM1R-qUzpsRA_y5FBFb9jE3uy8maIkefO0yJgShhQYIppgdxMRfQW__UNzGt0nVky0N4Li_BRzKXY=E39EBDA',
        jiraUrl: 'https://movonte.atlassian.net'
      }
    } as any;

    const mockRes = {
      status: (code: number) => ({
        json: (data: any) => {
          if (code === 201) {
            console.log('✅ Ticket creado exitosamente:', data);
          } else {
            console.log(`❌ Error ${code}:`, data);
          }
          return data;
        }
      })
    } as any;

    await controller.createTicketForServiceHandler(mockReq, mockRes);

    console.log('\n🎉 === TEST COMPLETED ===');

  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

// Ejecutar test
if (require.main === module) {
  testServiceTicketWithUserTokens();
}

export { testServiceTicketWithUserTokens };

