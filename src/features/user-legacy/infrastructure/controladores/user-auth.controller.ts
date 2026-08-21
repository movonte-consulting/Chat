import { Request, Response } from 'express';
import { LoginUseCase } from '../../application/login.use-case';
import { GetProfileUseCase } from '../../application/get-profile.use-case';

export class UserAuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly getProfileUseCase: GetProfileUseCase
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

      res.json({ success: true, data: result.data });
    } catch (error) {
      console.error('Error en login:', error);
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

      res.json({ success: true, data: { user: result.data } });
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}
