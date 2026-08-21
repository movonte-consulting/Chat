/**
 * Public surface of the user-webhooks feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export { userWebhookRouter, userWebhooksCrudRouter } from './infrastructure/dependency-injection';
