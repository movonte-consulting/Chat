import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../../../middleware/auth';
import { CorsController } from './controladores/cors.controller';

/** Montado en /api/admin/cors. */
export function buildCorsRouter(controller: CorsController): Router {
  const router = Router();
  router.get('/stats', authenticateToken, requireAdmin, controller.getStats.bind(controller));
  router.post('/reload', authenticateToken, requireAdmin, controller.forceReload.bind(controller));
  router.post('/add', authenticateToken, requireAdmin, controller.addDomain.bind(controller));
  router.delete('/:domain', authenticateToken, requireAdmin, controller.removeDomain.bind(controller));
  return router;
}
