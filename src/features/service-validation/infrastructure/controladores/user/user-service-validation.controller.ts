import { Request, Response } from 'express';
import { CreateValidationRequestUseCase } from '../../../application/user/create-validation-request.use-case';
import { GetUserValidationsUseCase } from '../../../application/user/get-user-validations.use-case';
import { GenerateProtectedTokenUseCase } from '../../../application/user/generate-protected-token.use-case';

export class UserServiceValidationController {
  constructor(
    private readonly createValidationRequestUseCase: CreateValidationRequestUseCase,
    private readonly getUserValidationsUseCase: GetUserValidationsUseCase,
    private readonly generateProtectedTokenUseCase: GenerateProtectedTokenUseCase
  ) {}

  public async createValidationRequest(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const result = await this.createValidationRequestUseCase.execute(req.user.id, req.body);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'user_not_found') {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

      res.status(201).json({
        success: true,
        message: 'Solicitud de validación creada exitosamente. Será revisada por un administrador.',
        data: result.data
      });
    } catch (error) {
      console.error('❌ Error creating validation request:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error interno del servidor' });
    }
  }

  public async getUserValidations(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const validations = await this.getUserValidationsUseCase.execute(req.user.id);

      res.json({ success: true, data: { validations, count: validations.length } });
    } catch (error) {
      console.error('❌ Error getting user validations:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error interno del servidor' });
    }
  }

  public async generateProtectedToken(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔐 Generating protected token for user:', req.user?.id);

      if (!req.user) {
        console.log('❌ No user in request');
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const { serviceId, expirationHours } = req.body;
      console.log('🔍 Service ID requested:', serviceId);
      console.log('⏰ Expiration hours requested:', expirationHours);

      const result = await this.generateProtectedTokenUseCase.execute(req.user.id, serviceId, expirationHours);

      if (result.kind === 'validation_error') {
        console.log('❌', result.message);
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'no_access') {
        console.log('❌ No service found for user:', req.user.id, 'service:', serviceId);
        res.status(403).json({ success: false, error: 'No tienes acceso a este servicio o el servicio no existe' });
        return;
      }
      if (result.kind === 'not_active') {
        console.log('❌ Service is not active');
        res.status(400).json({ success: false, error: 'El servicio no está activo. Actívalo primero para generar el token.' });
        return;
      }
      if (result.kind === 'not_approved') {
        console.log('❌ Service is not admin approved, status:', result.approvalStatus);
        res.status(403).json({
          success: false,
          error: result.approvalStatus === 'pending'
            ? 'El servicio está pendiente de aprobación por el administrador. Contacta al administrador para aprobar tu servicio.'
            : 'El servicio no ha sido aprobado por el administrador. Contacta al administrador para aprobar tu servicio.'
        });
        return;
      }

      console.log('✅ Protected token generated successfully with expiration:', result.expirationHours, 'hours');

      res.json({
        success: true,
        data: {
          protectedToken: result.protectedToken,
          serviceId,
          userId: req.user.id,
          expirationHours: result.expirationHours,
          expiresAt: new Date(Date.now() + result.expirationHours * 60 * 60 * 1000).toISOString(),
          message: `Token protegido generado con expiración de ${result.expirationHours} horas. Este token no expone credenciales reales.`
        }
      });
    } catch (error) {
      console.error('❌ Error generating protected token:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error interno del servidor' });
    }
  }
}
