import { Router } from 'express';
import { HealthController } from './controladores/health.controller';

/** Montado en /health. Rutas públicas, sin auth (igual que el original). */
export function buildHealthRouter(controller: HealthController): Router {
  const router = Router();
  router.get('/', controller.healthCheck.bind(controller));
  router.get('/detailed', controller.detailedHealth.bind(controller));
  return router;
}
