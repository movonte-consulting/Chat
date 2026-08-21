/**
 * Public surface of the ticket-control feature. Other features/routes must only import from
 * here, never reach into domain/application/infrastructure directly.
 */

export { adminTicketControlRouter, userTicketControlRouter } from './infrastructure/dependency-injection';
