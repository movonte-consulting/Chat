import { Router } from 'express';

import { RequesterJiraAdapter } from './adaptadores/requester-jira.adapter';
import { TicketToggleRegistryAdapter } from './adaptadores/admin/ticket-toggle-registry.adapter';
import { UserTicketToggleRegistryAdapter } from './adaptadores/user/user-ticket-toggle-registry.adapter';
import { AuthenticatedUserLookupAdapter } from './adaptadores/user/authenticated-user-lookup.adapter';

import { DisableAssistantForTicketUseCase as AdminDisableAssistantForTicketUseCase } from '../application/admin/disable-assistant-for-ticket.use-case';
import { EnableAssistantForTicketUseCase as AdminEnableAssistantForTicketUseCase } from '../application/admin/enable-assistant-for-ticket.use-case';
import { GetDisabledTicketsUseCase as AdminGetDisabledTicketsUseCase } from '../application/admin/get-disabled-tickets.use-case';
import { CheckTicketAssistantStatusUseCase as AdminCheckTicketAssistantStatusUseCase } from '../application/admin/check-ticket-assistant-status.use-case';

import { DisableAssistantForTicketUseCase as UserDisableAssistantForTicketUseCase } from '../application/user/disable-assistant-for-ticket.use-case';
import { EnableAssistantForTicketUseCase as UserEnableAssistantForTicketUseCase } from '../application/user/enable-assistant-for-ticket.use-case';
import { GetDisabledTicketsUseCase as UserGetDisabledTicketsUseCase } from '../application/user/get-disabled-tickets.use-case';
import { CheckTicketAssistantStatusUseCase as UserCheckTicketAssistantStatusUseCase } from '../application/user/check-ticket-assistant-status.use-case';

import { TicketControlController } from './controladores/admin/ticket-control.controller';
import { UserTicketControlController } from './controladores/user/user-ticket-control.controller';
import { buildAdminTicketControlRouter, buildUserTicketControlRouter } from './router';

// ── Infrastructure (compartida) ─────────────────────────────────────────────
const requesterJira = new RequesterJiraAdapter();

// ── Infrastructure (admin) ──────────────────────────────────────────────────
const ticketToggleRegistry = new TicketToggleRegistryAdapter();

const adminDisableAssistantForTicketUseCase = new AdminDisableAssistantForTicketUseCase(requesterJira, ticketToggleRegistry);
const adminEnableAssistantForTicketUseCase = new AdminEnableAssistantForTicketUseCase(requesterJira, ticketToggleRegistry);
const adminGetDisabledTicketsUseCase = new AdminGetDisabledTicketsUseCase(ticketToggleRegistry);
const adminCheckTicketAssistantStatusUseCase = new AdminCheckTicketAssistantStatusUseCase(ticketToggleRegistry);

const ticketControlController = new TicketControlController(
  adminDisableAssistantForTicketUseCase,
  adminEnableAssistantForTicketUseCase,
  adminGetDisabledTicketsUseCase,
  adminCheckTicketAssistantStatusUseCase
);

export const adminTicketControlRouter: Router = buildAdminTicketControlRouter(ticketControlController);

// ── Infrastructure (user) ───────────────────────────────────────────────────
const userTicketToggleRegistry = new UserTicketToggleRegistryAdapter();
const authenticatedUserLookup = new AuthenticatedUserLookupAdapter();

const userDisableAssistantForTicketUseCase = new UserDisableAssistantForTicketUseCase(authenticatedUserLookup, requesterJira, userTicketToggleRegistry);
const userEnableAssistantForTicketUseCase = new UserEnableAssistantForTicketUseCase(authenticatedUserLookup, requesterJira, userTicketToggleRegistry);
const userGetDisabledTicketsUseCase = new UserGetDisabledTicketsUseCase(authenticatedUserLookup, userTicketToggleRegistry);
const userCheckTicketAssistantStatusUseCase = new UserCheckTicketAssistantStatusUseCase(authenticatedUserLookup, requesterJira, userTicketToggleRegistry);

const userTicketControlController = new UserTicketControlController(
  userDisableAssistantForTicketUseCase,
  userEnableAssistantForTicketUseCase,
  userGetDisabledTicketsUseCase,
  userCheckTicketAssistantStatusUseCase
);

export const userTicketControlRouter: Router = buildUserTicketControlRouter(userTicketControlController);
