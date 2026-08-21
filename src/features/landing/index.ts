/**
 * Public surface of the landing feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export { landingRouter } from './infrastructure/dependency-injection';
