/**
 * Public surface of the admin-webhooks feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export { adminWebhooksRouter } from './infrastructure/dependency-injection';
