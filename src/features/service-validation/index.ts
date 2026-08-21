/**
 * Public surface of the service-validation feature. Other features/routes must only import from here,
 * never reach into domain/application/infrastructure directly.
 */

export {
  userServiceValidationRouter,
  adminServiceValidationRouter,
  validateProtectedToken
} from './infrastructure/dependency-injection';
