/**
 * Public surface of the contact feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export { contactRouter } from './infrastructure/dependency-injection';
