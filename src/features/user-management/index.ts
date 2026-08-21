/**
 * Public surface of the user-management feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export { userManagementRouter } from './infrastructure/dependency-injection';
