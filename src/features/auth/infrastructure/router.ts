import { Router } from 'express';
import { authenticateToken } from '../../../middleware/auth';
import { AuthController } from './controladores/auth.controller';

/** Montado en /api/auth. */
export function buildAuthRouter(controller: AuthController): Router {
  const router = Router();
  router.post('/login', controller.login.bind(controller));
  router.post('/logout', controller.logout.bind(controller));
  router.get('/verify', authenticateToken, controller.verifyToken.bind(controller));
  router.get('/profile', authenticateToken, controller.getProfile.bind(controller));
  router.put('/profile', authenticateToken, controller.updateProfile.bind(controller));
  router.put('/change-password', authenticateToken, controller.changePassword.bind(controller));
  return router;
}
