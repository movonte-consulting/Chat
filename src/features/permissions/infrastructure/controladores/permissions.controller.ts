import { Request, Response } from 'express';
import '../../../../middleware/auth';
import { GetUserPermissionsUseCase } from '../../application/get-user-permissions.use-case';
import { UpdateUserPermissionsUseCase } from '../../application/update-user-permissions.use-case';
import { GetUsersWithPermissionsUseCase } from '../../application/get-users-with-permissions.use-case';

export class PermissionsController {
  constructor(
    private readonly getUserPermissionsUseCase: GetUserPermissionsUseCase,
    private readonly updateUserPermissionsUseCase: UpdateUserPermissionsUseCase,
    private readonly getUsersWithPermissionsUseCase: GetUsersWithPermissionsUseCase
  ) {}

  async getUserPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const result = await this.getUserPermissionsUseCase.execute(req.user!.id, Number(userId));

      switch (result.kind) {
        case 'not_found':
          res.status(404).json({ success: false, error: 'Usuario no encontrado' });
          return;
        case 'forbidden':
          res.status(403).json({ success: false, error: 'No tienes permisos para ver este usuario' });
          return;
        case 'ok':
          res.json({
            success: true,
            data: {
              userId: result.userId,
              username: result.username,
              role: result.role,
              permissions: result.permissions
            },
            timestamp: new Date().toISOString()
          });
          return;
      }
    } catch (error) {
      console.error('❌ Error obteniendo permisos de usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async updateUserPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { permissions } = req.body;

      if (!permissions || typeof permissions !== 'object') {
        res.status(400).json({ success: false, error: 'Se requieren los permisos válidos' });
        return;
      }

      const result = await this.updateUserPermissionsUseCase.execute(req.user!.id, Number(userId), permissions);

      switch (result.kind) {
        case 'not_found':
          res.status(404).json({ success: false, error: 'Usuario no encontrado' });
          return;
        case 'forbidden':
          res.status(403).json({ success: false, error: 'No tienes permisos para modificar este usuario' });
          return;
        case 'admin_role_forbidden':
          res.status(400).json({ success: false, error: 'No se pueden modificar permisos de administradores' });
          return;
        case 'ok':
          console.log(`✅ Permisos actualizados para usuario ${result.username}:`, result.permissions);
          res.json({
            success: true,
            data: { userId: result.userId, username: result.username, permissions: result.permissions },
            message: 'Permisos actualizados exitosamente',
            timestamp: new Date().toISOString()
          });
          return;
      }
    } catch (error) {
      console.error('❌ Error actualizando permisos de usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async getUsersWithPermissions(req: Request, res: Response): Promise<void> {
    try {
      const usersWithPermissions = await this.getUsersWithPermissionsUseCase.execute(req.user!.id);
      res.json({
        success: true,
        data: usersWithPermissions,
        count: usersWithPermissions.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error obteniendo usuarios con permisos:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }
}
