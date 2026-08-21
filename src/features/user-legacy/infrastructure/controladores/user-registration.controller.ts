import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/register-user.use-case';

export class UserRegistrationController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  async registerUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ success: false, error: 'Solo administradores pueden registrar usuarios' });
        return;
      }

      const { username, email, password, role, permissions } = req.body;
      const result = await this.registerUserUseCase.execute(req.user.id, username, email, password, role, permissions);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'duplicate') {
        res.status(409).json({ success: false, error: 'El usuario ya existe' });
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
            permissions: result.data.permissions,
            createdAt: result.data.createdAt
          }
        }
      });
    } catch (error) {
      console.error('Error registrando usuario:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}
