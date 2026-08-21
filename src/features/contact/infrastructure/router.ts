import { Router } from 'express';
import { ContactController } from './controladores/contact.controller';

/** Montado en /api/contact. Rutas públicas, sin auth (igual que el original). */
export function buildContactRouter(controller: ContactController): Router {
  const router = Router();
  router.post('/', controller.submitContactForm.bind(controller));
  router.get('/test-jira', controller.testJiraConnection.bind(controller));
  return router;
}
