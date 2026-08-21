import { Request, Response } from 'express';
import { GetAllUsersUseCase } from '../../application/get-all-users.use-case';
import { CreateUserUseCase } from '../../application/create-user.use-case';
import { UpdateUserUseCase } from '../../application/update-user.use-case';
import { ChangeUserPasswordUseCase } from '../../application/change-user-password.use-case';
import { DeleteUserUseCase } from '../../application/delete-user.use-case';

/** Chequeo de rol admin redundante con requireAdmin del router — preservado del controller original. */
function isAdmin(req: Request): boolean {
  return !!req.user && req.user.role === 'admin';
}

export class UserManagementController {
  constructor(
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly changeUserPasswordUseCase: ChangeUserPasswordUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase
  ) {}

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      if (!isAdmin(req)) {
        res.status(403).json({ success: false, error: 'Acceso denegado. Se requieren permisos de administrador' });
        return;
      }

      const users = await this.getAllUsersUseCase.execute(req.user!.id);

      res.json({ success: true, data: { users } });
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      if (!isAdmin(req)) {
        res.status(403).json({ success: false, error: 'Acceso denegado. Se requieren permisos de administrador' });
        return;
      }

      const { username, email, password, role = 'user' } = req.body;
      const result = await this.createUserUseCase.execute(req.user!.id, username, email, password, role);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'duplicate') {
        res.status(400).json({ success: false, error: 'El username o email ya existe' });
        return;
      }

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: result.data.id,
            username: result.data.username,
            email: result.data.email,
            role: result.data.role,
            isActive: result.data.isActive,
            createdAt: result.data.createdAt
          }
        },
        message: 'Usuario creado exitosamente'
      });
    } catch (error) {
      console.error('Error creando usuario:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      if (!isAdmin(req)) {
        res.status(403).json({ success: false, error: 'Acceso denegado. Se requieren permisos de administrador' });
        return;
      }

      const { id } = req.params;
      const result = await this.updateUserUseCase.execute(req.user!.id, id, req.body);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }
      if (result.kind === 'forbidden') {
        res.status(403).json({ success: false, error: 'No tienes permisos para modificar este usuario' });
        return;
      }
      if (result.kind === 'duplicate') {
        res.status(400).json({ success: false, error: 'El username o email ya existe' });
        return;
      }

      res.json({
        success: true,
        data: {
          user: {
            id: result.data.id,
            username: result.data.username,
            email: result.data.email,
            role: result.data.role,
            isActive: result.data.isActive,
            lastLogin: result.data.lastLogin,
            updatedAt: result.data.updatedAt
          }
        },
        message: 'Usuario actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async changeUserPassword(req: Request, res: Response): Promise<void> {
    try {
      if (!isAdmin(req)) {
        res.status(403).json({ success: false, error: 'Acceso denegado. Se requieren permisos de administrador' });
        return;
      }

      const { id } = req.params;
      const { newPassword } = req.body;
      const result = await this.changeUserPasswordUseCase.execute(req.user!.id, id, newPassword);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }
      if (result.kind === 'forbidden') {
        res.status(403).json({ success: false, error: 'No tienes permisos para modificar este usuario' });
        return;
      }

      res.json({ success: true, message: 'Contraseña del usuario actualizada exitosamente' });
    } catch (error) {
      console.error('Error cambiando password del usuario:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      if (!isAdmin(req)) {
        res.status(403).json({ success: false, error: 'Acceso denegado. Se requieren permisos de administrador' });
        return;
      }

      const { id } = req.params;
      const result = await this.deleteUserUseCase.execute(req.user!.id, id);

      if (result.kind === 'self_delete_forbidden') {
        res.status(400).json({ success: false, error: 'No puedes eliminar tu propio usuario' });
        return;
      }
      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }
      if (result.kind === 'forbidden') {
        res.status(403).json({ success: false, error: 'No tienes permisos para eliminar este usuario' });
        return;
      }

      res.json({ success: true, message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}
