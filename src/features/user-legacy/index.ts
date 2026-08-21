/**
 * Public surface of the user-legacy feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export {
  userAuthRouter,
  userInstancesRouter,
  userLegacyServicesRouter,
  userLegacyWebhookRouter,
  userRegistrationRouter,
  userSetupRouter
} from './infrastructure/dependency-injection';
