/**
 * Public surface of the dashboard feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export { dashboardRouter } from './infrastructure/dependency-injection';
