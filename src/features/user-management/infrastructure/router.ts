import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../../../middleware/auth';
import { UserManagementController } from './controladores/user-management.controller';

/**
 * Montado en /api/admin/users. Comparte prefijo con el feature `permissions`
 * (/api/admin/users/permissions, /:userId/permissions) — sin colisión real, paths distintos.
 */
export function buildUserManagementRouter(controller: UserManagementController): Router {
  const router = Router();
  router.get('/', authenticateToken, requireAdmin, controller.getAllUsers.bind(controller));
  router.post('/', authenticateToken, requireAdmin, controller.createUser.bind(controller));
  router.put('/:id', authenticateToken, requireAdmin, controller.updateUser.bind(controller));
  router.put('/:id/password', authenticateToken, requireAdmin, controller.changeUserPassword.bind(controller));
  router.delete('/:id', authenticateToken, requireAdmin, controller.deleteUser.bind(controller));
  return router;
}
