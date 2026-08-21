/**
 * Public surface of the permissions feature. Other features/routes must only import from
 * here, never reach into domain/application/infrastructure directly.
 */

export { permissionsRouter } from './infrastructure/dependency-injection';
