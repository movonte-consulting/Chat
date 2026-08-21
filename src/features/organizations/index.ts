/**
 * Public surface of the organizations feature. Other features/routes must only import from
 * here, never reach into domain/application/infrastructure directly.
 */

export { organizationsRouter } from './infrastructure/dependency-injection';
