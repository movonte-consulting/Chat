/**
 * Public surface of the widget-integration feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export { widgetIntegrationRouter } from './infrastructure/dependency-injection';
