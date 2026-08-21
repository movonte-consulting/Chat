import { Request, Response } from 'express';
import { GetCorsStatsUseCase } from '../../application/get-cors-stats.use-case';
import { ReloadCorsUseCase } from '../../application/reload-cors.use-case';
import { AddCorsDomainUseCase } from '../../application/add-cors-domain.use-case';
import { RemoveCorsDomainUseCase } from '../../application/remove-cors-domain.use-case';

/**
 * El chequeo de rol admin aquí es una defensa redundante: la ruta ya monta requireAdmin
 * en el router, pero el controller original repetía la validación — se preserva tal cual.
 */
function isAdmin(req: Request): boolean {
  return !!req.user && req.user.role === 'admin';
}

export class CorsController {
  constructor(
    private readonly getCorsStatsUseCase: GetCorsStatsUseCase,
    private readonly reloadCorsUseCase: ReloadCorsUseCase,
    private readonly addCorsDomainUseCase: AddCorsDomainUseCase,
    private readonly removeCorsDomainUseCase: RemoveCorsDomainUseCase
  ) {}

  public async getStats(req: Request, res: Response): Promise<void> {
    try {
      const data = this.getCorsStatsUseCase.execute();
      res.json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error obteniendo estadísticas de CORS:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  public async forceReload(req: Request, res: Response): Promise<void> {
    try {
      if (!isAdmin(req)) {
        res.status(403).json({ success: false, error: 'Acceso denegado. Se requieren permisos de administrador' });
        return;
      }

      const data = await this.reloadCorsUseCase.execute();
      res.json({
        success: true,
        message: 'CORS recargado exitosamente desde la base de datos',
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error forzando recarga de CORS:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  public async addDomain(req: Request, res: Response): Promise<void> {
    try {
      if (!isAdmin(req)) {
        res.status(403).json({ success: false, error: 'Acceso denegado. Se requieren permisos de administrador' });
        return;
      }

      const { domain } = req.body;
      const result = await this.addCorsDomainUseCase.execute(domain);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({
        success: true,
        message: `Dominio '${domain}' agregado exitosamente a CORS`,
        data: result.stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error agregando dominio a CORS:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  public async removeDomain(req: Request, res: Response): Promise<void> {
    try {
      if (!isAdmin(req)) {
        res.status(403).json({ success: false, error: 'Acceso denegado. Se requieren permisos de administrador' });
        return;
      }

      const { domain } = req.params;
      const result = this.removeCorsDomainUseCase.execute(domain);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.json({
        success: true,
        message: `Dominio '${domain}' removido exitosamente de CORS`,
        data: result.stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error removiendo dominio de CORS:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }
}
