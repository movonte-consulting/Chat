import { ticketController } from '../features/tickets/infrastructure/dependency-injection';

async function testServiceTicketEndpoint() {
  console.log('🧪 === TESTING SERVICE TICKET ENDPOINT ===\n');

  try {
    const controller = ticketController;

    // 1. Verificar que el servicio existe
    console.log('1️⃣ Verificando configuración del servicio...');
    
    const { sequelize } = await import('../config/database');
    const [services] = await sequelize.query(`
      SELECT * FROM unified_configurations 
      WHERE service_id = 'hpla' AND is_active = TRUE
      LIMIT 1
    `);

    if (!services || (services as any[]).length === 0) {
      console.log('❌ No se encontró el servicio hpla activo');
      console.log('💡 Creando configuración de prueba...');
      
      // Crear configuración de prueba
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
      
      console.log('✅ Configuración de prueba creada');
    } else {
      console.log('✅ Servicio hpla encontrado:', (services as any[])[0]);
    }

    // 2. Probar obtener información del servicio
    console.log('\n2️⃣ Probando getServiceInfo...');
    
    const mockReq = {
      params: { serviceId: 'hpla' },
      query: { userId: '12' }
    } as any;
    
    const mockRes = {
      json: (data: any) => {
        console.log('📊 Respuesta getServiceInfo:', data);
        return data;
      },
      status: (code: number) => ({
        json: (data: any) => {
          console.log(`❌ Error ${code}:`, data);
          return data;
        }
      })
    } as any;

    await controller.getServiceInfoHandler(mockReq, mockRes);

    // 3. Probar creación de ticket
    console.log('\n3️⃣ Probando createTicketForService...');
    
    const mockReqCreate = {
      body: {
        customerInfo: {
          name: 'Usuario Test',
          email: 'test@example.com',
          company: 'Test Company',
          message: 'Mensaje de prueba desde script'
        },
        serviceId: 'hpla',
        userId: 12
      }
    } as any;

    const mockResCreate = {
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

    await controller.createTicketForServiceHandler(mockReqCreate, mockResCreate);

    console.log('\n🎉 === TEST COMPLETED ===');

  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

// Ejecutar test
if (require.main === module) {
  testServiceTicketEndpoint();
}

export { testServiceTicketEndpoint };

