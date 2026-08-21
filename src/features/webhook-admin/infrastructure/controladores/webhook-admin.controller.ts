import { Request, Response } from 'express';
import { ConfigureWebhookUseCase } from '../../application/configure-webhook.use-case';
import { TestWebhookUseCase } from '../../application/test-webhook.use-case';
import { DisableWebhookUseCase } from '../../application/disable-webhook.use-case';
import { GetWebhookStatusUseCase } from '../../application/get-webhook-status.use-case';
import { ConfigureWebhookFilterUseCase } from '../../application/configure-webhook-filter.use-case';
import { TestWebhookFilterUseCase } from '../../application/test-webhook-filter.use-case';
import { ConfigureStatusBasedDisableUseCase } from '../../application/configure-status-based-disable.use-case';
import { GetStatusBasedDisableConfigUseCase } from '../../application/get-status-based-disable-config.use-case';
import { GetAvailableStatusesUseCase } from '../../application/get-available-statuses.use-case';
import { RequesterJiraCredentials } from '../../domain/modelos/requester-jira-credentials.model';

const NO_CREDENTIALS_ERROR = 'No tienes credenciales de Jira configuradas. Configúralas en tu perfil.';

function requesterFrom(req: Request): RequesterJiraCredentials | null {
  if (!req.user) return null;
  return {
    userId: req.user.id,
    username: (req.user as any).username || '',
    email: req.user.email,
    jiraToken: req.user.jiraToken || null,
    jiraUrl: req.user.jiraUrl || null
  };
}

export class WebhookAdminController {
  constructor(
    private readonly configureWebhookUseCase: ConfigureWebhookUseCase,
    private readonly testWebhookUseCase: TestWebhookUseCase,
    private readonly disableWebhookUseCase: DisableWebhookUseCase,
    private readonly getWebhookStatusUseCase: GetWebhookStatusUseCase,
    private readonly configureWebhookFilterUseCase: ConfigureWebhookFilterUseCase,
    private readonly testWebhookFilterUseCase: TestWebhookFilterUseCase,
    private readonly configureStatusBasedDisableUseCase: ConfigureStatusBasedDisableUseCase,
    private readonly getStatusBasedDisableConfigUseCase: GetStatusBasedDisableConfigUseCase,
    private readonly getAvailableStatusesUseCase: GetAvailableStatusesUseCase
  ) {}

  async configureWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { webhookUrl, assistantId } = req.body;
      const result = await this.configureWebhookUseCase.execute(webhookUrl, assistantId);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'assistant_not_found') {
        res.status(400).json({ success: false, error: 'El asistente especificado no existe' });
        return;
      }

      res.json({
        success: true,
        message: 'Webhook configurado exitosamente',
        data: result.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error configurando webhook:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async testWebhook(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.testWebhookUseCase.execute();

      if (result.kind === 'not_configured') {
        res.status(400).json({ success: false, error: 'Webhook no configurado' });
        return;
      }
      if (result.kind === 'failed') {
        res.status(500).json({
          success: false,
          error: `Webhook test failed: ${result.testResult.error}`,
          data: { webhookUrl: result.webhookUrl, testResult: result.testResult }
        });
        return;
      }

      res.json({
        success: true,
        message: 'Webhook test successful',
        data: { webhookUrl: result.webhookUrl, testResult: result.testResult },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error probando webhook:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async disableWebhook(req: Request, res: Response): Promise<void> {
    try {
      await this.disableWebhookUseCase.execute();
      res.json({
        success: true,
        message: 'Webhook deshabilitado exitosamente',
        data: { isEnabled: false },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error deshabilitando webhook:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async getWebhookStatus(req: Request, res: Response): Promise<void> {
    try {
      const data = this.getWebhookStatusUseCase.execute();
      res.json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('❌ Error obteniendo estado del webhook:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async configureWebhookFilter(req: Request, res: Response): Promise<void> {
    try {
      const { filterEnabled, filterCondition, filterValue } = req.body;
      const data = await this.configureWebhookFilterUseCase.execute(filterEnabled, filterCondition, filterValue);
      res.json({ success: true, message: 'Filtro de webhook configurado exitosamente', data });
    } catch (error) {
      console.error('❌ Error configurando filtro de webhook:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async testWebhookFilter(req: Request, res: Response): Promise<void> {
    try {
      const { testResponse } = req.body;
      const data = this.testWebhookFilterUseCase.execute(testResponse);
      res.json({ success: true, data });
    } catch (error) {
      console.error('❌ Error testing webhook filter:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async configureStatusBasedDisable(req: Request, res: Response): Promise<void> {
    try {
      console.log('📦 Request body:', req.body);
      console.log('📋 Request headers:', req.headers);
      const { isEnabled, triggerStatuses } = req.body;
      const result = await this.configureStatusBasedDisableUseCase.execute(isEnabled, triggerStatuses);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({
        success: true,
        message: 'Status-based disable configuration saved successfully',
        data: result.data
      });
    } catch (error) {
      console.error('Error configuring status-based disable:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async getStatusBasedDisableConfig(req: Request, res: Response): Promise<void> {
    try {
      const config = this.getStatusBasedDisableConfigUseCase.execute();
      res.json({ success: true, data: config });
    } catch (error) {
      console.error('❌ Error getting status-based disable config:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async getAvailableStatuses(req: Request, res: Response): Promise<void> {
    try {
      const credentials = requesterFrom(req);
      const result = await this.getAvailableStatusesUseCase.execute(credentials);

      if (result.kind === 'no_credentials') {
        res.status(400).json({ success: false, error: NO_CREDENTIALS_ERROR });
        return;
      }

      res.json({ success: true, data: result.data });
    } catch (error) {
      console.error('❌ Error getting available statuses:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }
}
