import { Request, Response } from 'express';
import { GetUserWebhookConfigurationUseCase } from '../../application/get-user-webhook-configuration.use-case';
import { SetUserWebhookConfigurationUseCase } from '../../application/set-user-webhook-configuration.use-case';

export class UserLegacyWebhookController {
  constructor(
    private readonly getUserWebhookConfigurationUseCase: GetUserWebhookConfigurationUseCase,
    private readonly setUserWebhookConfigurationUseCase: SetUserWebhookConfigurationUseCase
  ) {}

  async getUserWebhookConfiguration(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const webhook = this.getUserWebhookConfigurationUseCase.execute(req.user.id);

      res.json({ success: true, data: { webhook } });
    } catch (error) {
      console.error('Error obteniendo configuración de webhook:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async setUserWebhookConfiguration(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const { name, url, description, isEnabled, filterEnabled, filterCondition, filterValue } = req.body;
      const result = await this.setUserWebhookConfigurationUseCase.execute(
        req.user.id, name, url, description, isEnabled, filterEnabled, filterCondition, filterValue
      );

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({ success: true, message: 'Configuración de webhook actualizada correctamente' });
    } catch (error) {
      console.error('Error configurando webhook:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}
