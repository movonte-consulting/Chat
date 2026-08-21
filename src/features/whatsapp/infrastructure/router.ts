import { Router } from 'express';
import { WhatsAppController } from './controladores/whatsapp.controller';

export function buildWhatsAppRouter(controller: WhatsAppController): Router {
  const router = Router();

  // No auth - Meta calls this
  router.get('/webhook', controller.verifyWebhook.bind(controller));
  router.post('/webhook', controller.handleWebhook.bind(controller));

  return router;
}
