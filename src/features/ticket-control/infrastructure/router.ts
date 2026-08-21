import { Router } from 'express';
import { authenticateToken, requirePermission } from '../../../middleware/auth';
import { TicketControlController } from './controladores/admin/ticket-control.controller';
import { UserTicketControlController } from './controladores/user/user-ticket-control.controller';

/** Montado en /api/admin/tickets — requiere permiso ticketControl. */
export function buildAdminTicketControlRouter(controller: TicketControlController): Router {
  const router = Router();

  router.post('/:issueKey/disable', authenticateToken, requirePermission('ticketControl'), controller.disableAssistantForTicket.bind(controller));
  router.post('/:issueKey/enable', authenticateToken, requirePermission('ticketControl'), controller.enableAssistantForTicket.bind(controller));
  router.get('/disabled', authenticateToken, requirePermission('ticketControl'), controller.getDisabledTickets.bind(controller));
  router.get('/:issueKey/status', authenticateToken, requirePermission('ticketControl'), controller.checkTicketAssistantStatus.bind(controller));

  return router;
}

/** Montado en /api/user/tickets — solo requiere estar autenticado (sin permiso admin). */
export function buildUserTicketControlRouter(controller: UserTicketControlController): Router {
  const router = Router();

  router.get('/disabled', authenticateToken, controller.getDisabledTickets.bind(controller));
  router.post('/:issueKey/disable', authenticateToken, controller.disableAssistantForTicket.bind(controller));
  router.post('/:issueKey/enable', authenticateToken, controller.enableAssistantForTicket.bind(controller));
  router.get('/:issueKey/status', authenticateToken, controller.checkTicketAssistantStatus.bind(controller));

  return router;
}
