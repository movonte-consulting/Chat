import { sequelize } from '../models';
import { User } from '../models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

async function testUserEndpoints() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');
    
    // Obtener usuario de prueba
    const user = await User.findOne({
      where: { username: 'testadmin' }
    });
    
    if (!user) {
      console.log('❌ Usuario testadmin no encontrado');
      return;
    }
    
    console.log(`👤 Usuario encontrado: ${user.username} (ID: ${user.id})`);
    
    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );
    
    console.log(`🔑 Token generado: ${token.substring(0, 50)}...`);
    
    // Probar endpoints directamente
    console.log('\n🧪 Probando endpoints de usuario:');
    
    // Simular request para getUserDashboard
    const mockReq = {
      user: { id: user.id, username: user.username, role: user.role }
    };
    
    const mockRes = {
      json: (data: any) => {
        console.log('✅ Respuesta del dashboard:', JSON.stringify(data, null, 2));
      },
      status: (code: number) => ({
        json: (data: any) => {
          console.log(`❌ Error ${code}:`, JSON.stringify(data, null, 2));
        }
      })
    };
    
    // Importar y probar los handlers del feature user-services
    const { getUserDashboard, getUserAssistants, getUserProjects } = await import('../features/user-services');

    console.log('\n📊 Probando getUserDashboard...');
    await getUserDashboard(mockReq as any, mockRes as any);

    console.log('\n🤖 Probando getUserAssistants...');
    await getUserAssistants(mockReq as any, mockRes as any);

    console.log('\n📋 Probando getUserProjects...');
    await getUserProjects(mockReq as any, mockRes as any);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

testUserEndpoints();
