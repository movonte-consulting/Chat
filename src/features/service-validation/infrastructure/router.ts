import { Router } from 'express';
import { authenticateToken } from '../../../middleware/auth';
import { UserServiceValidationController } from './controladores/user/user-service-validation.controller';
import { AdminServiceValidationController } from './controladores/admin/admin-service-validation.controller';

/** Montado en /api/user/service-validation. */
export function buildUserServiceValidationRouter(controller: UserServiceValidationController): Router {
  const router = Router();
  router.get('/requests', authenticateToken, controller.getUserValidations.bind(controller));
  router.post('/protected-token', authenticateToken, controller.generateProtectedToken.bind(controller));
  return router;
}

/** Montado en /api/admin/service-validation. El chequeo de rol admin va dentro del controller (igual que el original). */
export function buildAdminServiceValidationRouter(controller: AdminServiceValidationController): Router {
  const router = Router();
  router.get('/pending', authenticateToken, controller.getPendingValidations.bind(controller));
  router.post('/:id/approve', authenticateToken, controller.approveValidation.bind(controller));
  router.post('/:id/reject', authenticateToken, controller.rejectValidation.bind(controller));
  return router;
}
