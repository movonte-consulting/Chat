import { Router } from 'express';
import { authenticateToken } from '../../../middleware/auth';
import { TicketController } from './controladores/ticket.controller';
import { JiraAccountsController } from './controladores/jira-accounts.controller';

export function buildTicketsRouter(
  ticketController: TicketController,
  jiraAccountsController: JiraAccountsController
): Router {
  const router = Router();

  router.post('/create-ticket', authenticateToken, ticketController.createTicketForServiceHandler);
  router.get('/:serviceId/info', authenticateToken, ticketController.getServiceInfoHandler);

  router.get('/:serviceId/jira-accounts', authenticateToken, jiraAccountsController.getServiceJiraAccountsHandler);
  router.post('/:serviceId/jira-accounts', authenticateToken, jiraAccountsController.upsertServiceJiraAccountsHandler);
  router.put('/:serviceId/jira-accounts', authenticateToken, jiraAccountsController.upsertServiceJiraAccountsHandler);
  router.delete('/:serviceId/jira-accounts', authenticateToken, jiraAccountsController.deleteServiceJiraAccountsHandler);

  return router;
}
