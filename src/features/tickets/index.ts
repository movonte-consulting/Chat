/**
 * Public surface of the tickets feature. Other features must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export { ticketsRouter, createTicketForWhatsApp, getAssistantJiraAccount, getWidgetJiraAccount } from './infrastructure/dependency-injection';
