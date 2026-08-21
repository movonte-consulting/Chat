/**
 * Public surface of the chatkit feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export { chatkitSessionRouter, chatkitWidgetRouter, chatkitWebhookRouter } from './infrastructure/dependency-injection';
