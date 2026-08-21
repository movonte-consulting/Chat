import { Router } from 'express';
import { authenticateToken } from '../../../middleware/auth';
import { DashboardController } from './controladores/dashboard.controller';

/** Montado en /api/admin/dashboard. Solo authenticateToken (sin requirePermission), igual que el original. */
export function buildDashboardRouter(controller: DashboardController): Router {
  const router = Router();
  router.get('/', authenticateToken, controller.getDashboard.bind(controller));
  return router;
}
