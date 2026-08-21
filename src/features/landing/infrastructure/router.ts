import { Router } from 'express';
import { LandingController } from './controladores/landing.controller';

/** Montado en /api/landing. Rutas públicas, sin auth (igual que el original). */
export function buildLandingRouter(controller: LandingController): Router {
  const router = Router();
  router.post('/create-ticket', controller.createTicketFromLanding.bind(controller));
  router.post('/validate-form', controller.validateLandingForm.bind(controller));
  router.get('/form-fields', controller.getLandingFormFields.bind(controller));
  return router;
}
