import { Request, Response } from 'express';
import { GetUserDashboardUseCase } from '../../application/get-user-dashboard.use-case';
import { CreateUserServiceUseCase } from '../../application/create-user-service.use-case';
import { GetUserServicesUseCase } from '../../application/get-user-services.use-case';
import { UpdateUserServiceUseCase } from '../../application/update-user-service.use-case';
import { DeleteUserServiceUseCase } from '../../application/delete-user-service.use-case';
import { ChatWithUserServiceUseCase } from '../../application/chat-with-user-service.use-case';
import { GetUserAvailableStatusesUseCase } from '../../application/get-user-available-statuses.use-case';
import { GetUserAssistantsUseCase } from '../../application/get-user-assistants.use-case';
import { GetUserProjectsUseCase } from '../../application/get-user-projects.use-case';
import { GetActiveAssistantForUserServiceUseCase } from '../../application/get-active-assistant-for-user-service.use-case';

export class UserServicesController {
  constructor(
    private readonly getUserDashboardUseCase: GetUserDashboardUseCase,
    private readonly createUserServiceUseCase: CreateUserServiceUseCase,
    private readonly getUserServicesUseCase: GetUserServicesUseCase,
    private readonly updateUserServiceUseCase: UpdateUserServiceUseCase,
    private readonly deleteUserServiceUseCase: DeleteUserServiceUseCase,
    private readonly chatWithUserServiceUseCase: ChatWithUserServiceUseCase,
    private readonly getUserAvailableStatusesUseCase: GetUserAvailableStatusesUseCase,
    private readonly getUserAssistantsUseCase: GetUserAssistantsUseCase,
    private readonly getUserProjectsUseCase: GetUserProjectsUseCase,
    private readonly getActiveAssistantForUserServiceUseCase: GetActiveAssistantForUserServiceUseCase
  ) {}

  async getUserDashboard(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const result = await this.getUserDashboardUseCase.execute(req.user.id);
      if (result.kind === 'missing_tokens') {
        res.status(400).json({ success: false, error: 'Usuario no tiene tokens configurados. Complete la configuración inicial.' });
        return;
      }

      res.json({ success: true, data: result.data, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error obteniendo dashboard del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async createUserService(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const result = await this.createUserServiceUseCase.execute(req.user.id, req.body);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'missing_openai_token') {
        res.status(400).json({ success: false, error: 'Usuario no tiene token de OpenAI configurado' });
        return;
      }
      if (result.kind === 'assistant_not_found') {
        res.status(400).json({ success: false, error: 'El asistente especificado no existe en tu cuenta' });
        return;
      }
      if (result.kind === 'already_exists') {
        res.status(400).json({ success: false, error: `El servicio '${result.serviceId}' ya existe` });
        return;
      }
      if (result.kind === 'internal_error') {
        res.status(500).json({ success: false, error: 'Error interno al crear servicio' });
        return;
      }

      res.json({
        success: true,
        message: `Servicio '${req.body.serviceName}' creado exitosamente`,
        isAdmin: result.isAdmin,
        data: result.data
      });
    } catch (error) {
      console.error('Error creando servicio del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async getUserServices(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const data = await this.getUserServicesUseCase.execute(req.user.id);
      console.log(`📊 Servicios encontrados para usuario ${req.user.id}:`, data);

      res.json({ success: true, data });
    } catch (error) {
      console.error('Error obteniendo servicios del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async updateUserService(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const { serviceId } = req.params;
      const result = await this.updateUserServiceUseCase.execute(req.user.id, serviceId, req.body);

      if (result.kind === 'missing_openai_token') {
        res.status(400).json({ success: false, error: 'Usuario no tiene token de OpenAI configurado' });
        return;
      }
      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: `Servicio '${result.serviceId}' no encontrado` });
        return;
      }
      if (result.kind === 'assistant_not_found') {
        res.status(400).json({ success: false, error: 'El asistente especificado no existe en tu cuenta' });
        return;
      }

      res.json({ success: true, message: `Servicio '${serviceId}' actualizado exitosamente`, data: result.data });
    } catch (error) {
      console.error('Error actualizando servicio del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async deleteUserService(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const { serviceId } = req.params;
      const result = await this.deleteUserServiceUseCase.execute(req.user.id, serviceId);

      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: `Servicio '${result.serviceId}' no encontrado` });
        return;
      }

      res.json({ success: true, message: `Servicio '${serviceId}' eliminado exitosamente` });
    } catch (error) {
      console.error('Error eliminando servicio del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async chatWithUserService(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const { serviceId } = req.params;
      const { message, threadId } = req.body;
      const result = await this.chatWithUserServiceUseCase.execute(req.user.id, serviceId, message, threadId);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'missing_openai_token') {
        res.status(400).json({ success: false, error: 'Usuario no tiene token de OpenAI configurado' });
        return;
      }
      if (result.kind === 'failed') {
        res.status(400).json({ success: false, error: result.error });
        return;
      }

      res.json({
        success: true,
        response: result.data.response,
        threadId: result.data.threadId,
        assistantId: result.data.assistantId,
        assistantName: result.data.assistantName
      });
    } catch (error) {
      console.error('Error en chat del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async getUserAvailableStatuses(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const result = await this.getUserAvailableStatusesUseCase.execute(req.user.id, req, res);
      if (result.kind === 'delegated') {
        return;
      }

      res.json({ success: true, data: result.data });
    } catch (error) {
      console.error('❌ Error getting user available statuses:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async getUserAssistants(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const result = await this.getUserAssistantsUseCase.execute(req.user.id);
      if (result.kind === 'missing_openai_token') {
        res.status(400).json({ success: false, error: 'Usuario no tiene token de OpenAI configurado' });
        return;
      }

      res.json({ success: true, data: result.data });
    } catch (error) {
      console.error('Error obteniendo asistentes del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async getUserProjects(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const result = await this.getUserProjectsUseCase.execute(req.user.id);
      if (result.kind === 'missing_jira_token') {
        res.status(400).json({ success: false, error: 'Usuario no tiene token de Jira configurado' });
        return;
      }

      res.json({ success: true, data: result.data });
    } catch (error) {
      console.error('Error obteniendo proyectos del usuario:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async getActiveAssistantForUserService(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const result = await this.getActiveAssistantForUserServiceUseCase.execute(serviceId);

      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: `Servicio '${serviceId}' no disponible` });
        return;
      }

      res.json({ success: true, data: result.data, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error obteniendo asistente activo:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }
}
