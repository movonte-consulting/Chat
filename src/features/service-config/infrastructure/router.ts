import { Router } from 'express';
import { authenticateToken, requirePermission } from '../../../middleware/auth';
import { ServiceConfigController } from './controladores/service-config.controller';

/** Montado en /api/admin/services. getActiveAssistantForService NO va aquí — es una ruta pública
 * bajo /api/services (prefijo compartido con /api/services/:serviceId/chat de chatbot). */
export function buildServiceConfigRouter(controller: ServiceConfigController): Router {
  const router = Router();

  router.get('/:serviceId', authenticateToken, requirePermission('serviceManagement'), controller.getServiceConfiguration.bind(controller));
  router.put('/:serviceId', authenticateToken, requirePermission('serviceManagement'), controller.updateServiceConfiguration.bind(controller));
  router.patch('/:serviceId/toggle', authenticateToken, requirePermission('serviceManagement'), controller.toggleService.bind(controller));
  router.post('/', authenticateToken, requirePermission('serviceManagement'), controller.addService.bind(controller));
  router.delete('/:serviceId', authenticateToken, requirePermission('serviceManagement'), controller.removeService.bind(controller));

  return router;
}
