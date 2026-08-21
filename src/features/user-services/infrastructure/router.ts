import { Router } from 'express';
import { authenticateToken } from '../../../middleware/auth';
import { UserServicesController } from './controladores/user-services.controller';

/** Montado en /api/user. getActiveAssistantForUserService es la única ruta pública (sin auth). */
export function buildUserServicesRouter(controller: UserServicesController): Router {
  const router = Router();

  router.get('/dashboard', authenticateToken, controller.getUserDashboard.bind(controller));

  router.post('/services/create', authenticateToken, controller.createUserService.bind(controller));
  router.get('/services/list', authenticateToken, controller.getUserServices.bind(controller));
  router.put('/services/:serviceId', authenticateToken, controller.updateUserService.bind(controller));
  router.delete('/services/:serviceId', authenticateToken, controller.deleteUserService.bind(controller));

  router.get('/statuses/available', authenticateToken, controller.getUserAvailableStatuses.bind(controller));

  router.post('/services/:serviceId/chat', authenticateToken, controller.chatWithUserService.bind(controller));

  router.get('/assistants', authenticateToken, controller.getUserAssistants.bind(controller));
  router.get('/projects', authenticateToken, controller.getUserProjects.bind(controller));

  router.get('/services/:serviceId/assistant', controller.getActiveAssistantForUserService.bind(controller));

  return router;
}
