import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../../../middleware/auth';
import { UserAuthController } from './controladores/user-auth.controller';
import { UserInstancesController } from './controladores/user-instances.controller';
import { UserLegacyServicesController } from './controladores/user-legacy-services.controller';
import { UserLegacyWebhookController } from './controladores/user-legacy-webhook.controller';
import { UserRegistrationController } from './controladores/user-registration.controller';
import { UserSetupController } from './controladores/user-setup.controller';

/** Montado en /api/user. */
export function buildUserAuthRouter(controller: UserAuthController): Router {
  const router = Router();
  router.post('/login', controller.login.bind(controller));
  router.get('/profile', authenticateToken, controller.getProfile.bind(controller));
  return router;
}

/** Montado en /api/user/instances. */
export function buildUserInstancesRouter(controller: UserInstancesController): Router {
  const router = Router();
  router.get('/', authenticateToken, controller.getUserInstances.bind(controller));
  router.post('/', authenticateToken, controller.createInstance.bind(controller));
  router.put('/:id', authenticateToken, controller.updateInstance.bind(controller));
  router.delete('/:id', authenticateToken, controller.deleteInstance.bind(controller));
  return router;
}

/**
 * Montado en /api/user/services — solo ruta raíz (GET/POST exactos). No colisiona con
 * /api/user/services/create|list|:serviceId|... del feature user-services.
 */
export function buildUserLegacyServicesRouter(controller: UserLegacyServicesController): Router {
  const router = Router();
  router.get('/', authenticateToken, controller.getUserServiceConfigurations.bind(controller));
  router.post('/', authenticateToken, controller.setUserServiceConfiguration.bind(controller));
  return router;
}

/**
 * Montado en /api/user/webhook — solo ruta raíz (GET/POST exactos). No colisiona con
 * /api/user/webhook/status|configure|... del feature user-webhooks (sub-rutas distintas).
 */
export function buildUserLegacyWebhookRouter(controller: UserLegacyWebhookController): Router {
  const router = Router();
  router.get('/', authenticateToken, controller.getUserWebhookConfiguration.bind(controller));
  router.post('/', authenticateToken, controller.setUserWebhookConfiguration.bind(controller));
  return router;
}

/** Montado en /api/user/register. */
export function buildUserRegistrationRouter(controller: UserRegistrationController): Router {
  const router = Router();
  router.post('/', authenticateToken, requireAdmin, controller.registerUser.bind(controller));
  return router;
}

/** Montado en /api/user/setup. */
export function buildUserSetupRouter(controller: UserSetupController): Router {
  const router = Router();
  router.get('/status', authenticateToken, controller.getInitialSetupStatus.bind(controller));
  router.post('/complete', authenticateToken, controller.completeInitialSetup.bind(controller));
  router.post('/validate-tokens', authenticateToken, controller.validateTokens.bind(controller));
  return router;
}
