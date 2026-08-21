/**
 * Public surface of the user-services feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export {
  userServicesRouter,
  getUserDashboard,
  getUserAssistants,
  getUserProjects
} from './infrastructure/dependency-injection';
