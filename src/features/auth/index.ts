/**
 * Public surface of the auth feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export { authRouter, login } from './infrastructure/dependency-injection';
