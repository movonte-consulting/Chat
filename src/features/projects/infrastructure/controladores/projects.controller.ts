import { Request, Response } from 'express';
import '../../../../middleware/auth';
import { RequesterJiraCredentials } from '../../domain/modelos/requester-jira-credentials.model';
import { ListProjectsUseCase } from '../../application/list-projects.use-case';
import { SetActiveProjectUseCase } from '../../application/set-active-project.use-case';
import { GetActiveProjectUseCase } from '../../application/get-active-project.use-case';
import { GetProjectDetailsUseCase } from '../../application/get-project-details.use-case';
import { TestJiraConnectionUseCase } from '../../application/test-jira-connection.use-case';

const NO_CREDENTIALS_ERROR = 'No tienes credenciales de Jira configuradas. Configúralas en tu perfil.';

export class ProjectsController {
  constructor(
    private readonly listProjectsUseCase: ListProjectsUseCase,
    private readonly setActiveProjectUseCase: SetActiveProjectUseCase,
    private readonly getActiveProjectUseCase: GetActiveProjectUseCase,
    private readonly getProjectDetailsUseCase: GetProjectDetailsUseCase,
    private readonly testJiraConnectionUseCase: TestJiraConnectionUseCase
  ) {}

  private requesterFrom(req: Request): RequesterJiraCredentials {
    return {
      userId: req.user!.id,
      username: req.user!.username,
      email: req.user!.email,
      jiraToken: req.user!.jiraToken ?? null,
      jiraUrl: (req.user as any).jiraUrl ?? null
    };
  }

  async listProjects(req: Request, res: Response): Promise<void> {
    try {
      console.log('📋 Solicitando lista de proyectos de Jira...');

      const result = await this.listProjectsUseCase.execute(this.requesterFrom(req));

      if (result.kind === 'no_credentials') {
        res.status(400).json({ success: false, error: NO_CREDENTIALS_ERROR });
        return;
      }

      res.json({ success: true, projects: result.projects, count: result.projects.length, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('❌ Error al listar proyectos:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido al listar proyectos' });
    }
  }

  async setActiveProject(req: Request, res: Response): Promise<void> {
    try {
      const { projectKey } = req.body;

      if (!projectKey) {
        res.status(400).json({ success: false, error: 'Se requiere el key del proyecto' });
        return;
      }

      console.log(`🔄 Cambiando proyecto activo a: ${projectKey}`);

      const result = await this.setActiveProjectUseCase.execute(this.requesterFrom(req), projectKey);

      switch (result.kind) {
        case 'no_credentials':
          res.status(400).json({ success: false, error: NO_CREDENTIALS_ERROR });
          return;
        case 'not_found':
          res.status(400).json({ success: false, error: 'El proyecto especificado no existe' });
          return;
        case 'ok':
          res.json({
            success: true,
            message: 'Proyecto activo cambiado exitosamente',
            activeProject: result.activeProject,
            timestamp: new Date().toISOString()
          });
          return;
      }
    } catch (error) {
      console.error('❌ Error al cambiar proyecto activo:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido al cambiar proyecto' });
    }
  }

  async getActiveProject(req: Request, res: Response): Promise<void> {
    try {
      const activeProject = this.getActiveProjectUseCase.execute();
      res.json({ success: true, activeProject, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('❌ Error al obtener proyecto activo:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido al obtener proyecto activo' });
    }
  }

  async getProjectDetails(req: Request, res: Response): Promise<void> {
    try {
      const { projectKey } = req.params;

      if (!projectKey) {
        res.status(400).json({ success: false, error: 'Se requiere el key del proyecto' });
        return;
      }

      console.log(`🔍 Obteniendo detalles del proyecto: ${projectKey}`);

      const result = await this.getProjectDetailsUseCase.execute(this.requesterFrom(req), projectKey);

      if (result.kind === 'no_credentials') {
        res.status(400).json({ success: false, error: NO_CREDENTIALS_ERROR });
        return;
      }

      res.json({ success: true, project: result.project, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('❌ Error al obtener detalles del proyecto:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido al obtener detalles del proyecto' });
    }
  }

  async testJiraConnection(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔗 Probando conexión con Jira...');

      const result = await this.testJiraConnectionUseCase.execute(this.requesterFrom(req));

      if (result.kind === 'no_credentials') {
        res.status(400).json({ success: false, error: NO_CREDENTIALS_ERROR });
        return;
      }

      res.json({
        success: true,
        message: 'Conexión con Jira exitosa',
        data: result.connectionResult,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error al probar conexión con Jira:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido al probar conexión con Jira' });
    }
  }
}
