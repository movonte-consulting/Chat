/**
 * Public surface of the projects feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export { projectsRouter, testJiraConnection, testJiraConnectionMiddlewares } from './infrastructure/dependency-injection';
