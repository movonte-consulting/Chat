import { Request, Response } from 'express';
import { CompleteInitialSetupUseCase } from '../../application/complete-initial-setup.use-case';
import { GetInitialSetupStatusUseCase } from '../../application/get-initial-setup-status.use-case';
import { ValidateTokensUseCase } from '../../application/validate-tokens.use-case';

export class UserSetupController {
  constructor(
    private readonly completeInitialSetupUseCase: CompleteInitialSetupUseCase,
    private readonly getInitialSetupStatusUseCase: GetInitialSetupStatusUseCase,
    private readonly validateTokensUseCase: ValidateTokensUseCase
  ) {}

  async completeInitialSetup(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const { jiraToken, jiraUrl, openaiToken, organizationLogo } = req.body;
      const result = await this.completeInitialSetupUseCase.execute(req.user.id, jiraToken, jiraUrl, openaiToken, organizationLogo);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({
        success: true,
        message: 'Configuración inicial completada correctamente',
        data: {
          isInitialSetupComplete: true,
          organizationLogo: result.organizationLogo || (req.user as any).organizationLogo
        }
      });
    } catch (error) {
      console.error('Error completando configuración inicial:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async getInitialSetupStatus(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const result = await this.getInitialSetupStatusUseCase.execute(req.user.id);
      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        return;
      }

      res.json({
        success: true,
        data: {
          isInitialSetupComplete: result.isInitialSetupComplete,
          hasJiraToken: result.hasJiraToken,
          hasOpenaiToken: result.hasOpenaiToken,
          requiresInitialSetup: !result.isInitialSetupComplete
        }
      });
    } catch (error) {
      console.error('Error obteniendo estado de configuración:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async validateTokens(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const { jiraToken, openaiToken } = req.body;
      const result = this.validateTokensUseCase.execute(jiraToken, openaiToken);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({
        success: result.allValid,
        data: { validation: result.validation, allTokensValid: result.allValid }
      });
    } catch (error) {
      console.error('Error validando tokens:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}
