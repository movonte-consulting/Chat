import { Request, Response } from 'express';
import { LoginUseCase } from '../../application/login.use-case';
import { GetProfileUseCase } from '../../application/get-profile.use-case';
import { UpdateProfileUseCase } from '../../application/update-profile.use-case';
import { ChangePasswordUseCase } from '../../application/change-password.use-case';

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      const result = await this.loginUseCase.execute(username, password);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'invalid_credentials') {
        res.status(401).json({ success: false, error: 'Credenciales inválidas' });
        return;
      }
      if (result.kind === 'inactive') {
        res.status(401).json({ success: false, error: 'Usuario inactivo. Contacta al administrador' });
        return;
      }

      res.cookie('authToken', result.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        data: {
          token: result.data.token,
          user: result.data.user,
          requiresInitialSetup: result.data.requiresInitialSetup
        },
        message: 'Login exitoso'
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie('authToken');
      res.json({ success: true, message: 'Logout exitoso' });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      res.json({ success: true, data: { user: req.user }, message: 'Token válido' });
    } catch (error) {
      console.error('Error verificando token:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const result = await this.getProfileUseCase.execute(req.user.id);
      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

      const userData = { ...req.user, isInitialSetupComplete: result.isInitialSetupComplete };

      res.json({ success: true, data: { user: userData } });
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const { organizationLogo } = req.body;
      const result = await this.updateProfileUseCase.execute(req.user.id, organizationLogo);

      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

      res.json({ success: true, data: { user: result.user }, message: 'Perfil actualizado correctamente' });
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      const result = await this.changePasswordUseCase.execute(req.user.id, currentPassword, newPassword);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }
      if (result.kind === 'invalid_current_password') {
        res.status(401).json({ success: false, error: 'Contraseña actual incorrecta' });
        return;
      }

      res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      console.error('Error cambiando password:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}
