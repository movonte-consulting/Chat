/**
 * Public surface of the health feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export { healthRouter } from './infrastructure/dependency-injection';
