/**
 * Public surface of the service-config feature. Other features/routes must only import from
 * here, never reach into domain/application/infrastructure directly.
 */

export { serviceConfigRouter, getActiveAssistantForService } from './infrastructure/dependency-injection';
