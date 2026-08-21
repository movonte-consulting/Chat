/**
 * Public surface of the webhook-admin feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export { webhookAdminRouter, getAvailableStatuses } from './infrastructure/dependency-injection';
