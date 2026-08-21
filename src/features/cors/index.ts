/**
 * Public surface of the cors feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export { corsRouter } from './infrastructure/dependency-injection';
