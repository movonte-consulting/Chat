import { Request, Response } from 'express';
import { GetUserServiceConfigurationsUseCase } from '../../application/get-user-service-configurations.use-case';
import { SetUserServiceConfigurationUseCase } from '../../application/set-user-service-configuration.use-case';

export class UserLegacyServicesController {
  constructor(
    private readonly getUserServiceConfigurationsUseCase: GetUserServiceConfigurationsUseCase,
    private readonly setUserServiceConfigurationUseCase: SetUserServiceConfigurationUseCase
  ) {}

  async getUserServiceConfigurations(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const configurations = this.getUserServiceConfigurationsUseCase.execute(req.user.id);

      res.json({ success: true, data: { configurations } });
    } catch (error) {
      console.error('Error obteniendo configuraciones:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async setUserServiceConfiguration(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const { serviceId, serviceName, assistantId, assistantName, isActive, configuration } = req.body;
      const result = await this.setUserServiceConfigurationUseCase.execute(
        req.user.id, serviceId, serviceName, assistantId, assistantName, isActive, configuration
      );

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({ success: true, message: 'Configuración de servicio actualizada correctamente' });
    } catch (error) {
      console.error('Error configurando servicio:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}
