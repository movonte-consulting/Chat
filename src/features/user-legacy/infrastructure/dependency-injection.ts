import { Router } from 'express';

import { UserConfigurationServiceAdapter } from './adaptadores/user-configuration-service.adapter';
import { SequelizeUserLegacyAdapter } from './adaptadores/sequelize-user-legacy.adapter';
import { JwtTokenIssuerAdapter } from './adaptadores/jwt-token-issuer.adapter';
import { BcryptPasswordVerifierAdapter } from './adaptadores/bcrypt-password-verifier.adapter';
import { BcryptPasswordHasherAdapter } from './adaptadores/bcrypt-password-hasher.adapter';

import { LoginUseCase } from '../application/login.use-case';
import { GetProfileUseCase } from '../application/get-profile.use-case';
import { GetUserInstancesUseCase } from '../application/get-user-instances.use-case';
import { CreateInstanceUseCase } from '../application/create-instance.use-case';
import { UpdateInstanceUseCase } from '../application/update-instance.use-case';
import { DeleteInstanceUseCase } from '../application/delete-instance.use-case';
import { GetUserServiceConfigurationsUseCase } from '../application/get-user-service-configurations.use-case';
import { SetUserServiceConfigurationUseCase } from '../application/set-user-service-configuration.use-case';
import { GetUserWebhookConfigurationUseCase } from '../application/get-user-webhook-configuration.use-case';
import { SetUserWebhookConfigurationUseCase } from '../application/set-user-webhook-configuration.use-case';
import { RegisterUserUseCase } from '../application/register-user.use-case';
import { CompleteInitialSetupUseCase } from '../application/complete-initial-setup.use-case';
import { GetInitialSetupStatusUseCase } from '../application/get-initial-setup-status.use-case';
import { ValidateTokensUseCase } from '../application/validate-tokens.use-case';

import { UserAuthController } from './controladores/user-auth.controller';
import { UserInstancesController } from './controladores/user-instances.controller';
import { UserLegacyServicesController } from './controladores/user-legacy-services.controller';
import { UserLegacyWebhookController } from './controladores/user-legacy-webhook.controller';
import { UserRegistrationController } from './controladores/user-registration.controller';
import { UserSetupController } from './controladores/user-setup.controller';

import {
  buildUserAuthRouter,
  buildUserInstancesRouter,
  buildUserLegacyServicesRouter,
  buildUserLegacyWebhookRouter,
  buildUserRegistrationRouter,
  buildUserSetupRouter
} from './router';

// ── Infrastructure ───────────────────────────────────────────────────────────
const userConfigurationService = new UserConfigurationServiceAdapter();
const sequelizeUserLegacy = new SequelizeUserLegacyAdapter();
const tokenIssuer = new JwtTokenIssuerAdapter();
const passwordVerifier = new BcryptPasswordVerifierAdapter();
const passwordHasher = new BcryptPasswordHasherAdapter();

// ── Application ───────────────────────────────────────────────────────────────
const loginUseCase = new LoginUseCase(sequelizeUserLegacy, passwordVerifier, tokenIssuer);
const getProfileUseCase = new GetProfileUseCase(sequelizeUserLegacy);

const getUserInstancesUseCase = new GetUserInstancesUseCase(userConfigurationService);
const createInstanceUseCase = new CreateInstanceUseCase(userConfigurationService);
const updateInstanceUseCase = new UpdateInstanceUseCase(userConfigurationService);
const deleteInstanceUseCase = new DeleteInstanceUseCase(userConfigurationService);

const getUserServiceConfigurationsUseCase = new GetUserServiceConfigurationsUseCase(userConfigurationService);
const setUserServiceConfigurationUseCase = new SetUserServiceConfigurationUseCase(userConfigurationService);

const getUserWebhookConfigurationUseCase = new GetUserWebhookConfigurationUseCase(userConfigurationService);
const setUserWebhookConfigurationUseCase = new SetUserWebhookConfigurationUseCase(userConfigurationService);

const registerUserUseCase = new RegisterUserUseCase(sequelizeUserLegacy, passwordHasher);

const completeInitialSetupUseCase = new CompleteInitialSetupUseCase(sequelizeUserLegacy);
const getInitialSetupStatusUseCase = new GetInitialSetupStatusUseCase(sequelizeUserLegacy);
const validateTokensUseCase = new ValidateTokensUseCase();

// ── Presentation ─────────────────────────────────────────────────────────────
const userAuthController = new UserAuthController(loginUseCase, getProfileUseCase);
const userInstancesController = new UserInstancesController(
  getUserInstancesUseCase,
  createInstanceUseCase,
  updateInstanceUseCase,
  deleteInstanceUseCase
);
const userLegacyServicesController = new UserLegacyServicesController(
  getUserServiceConfigurationsUseCase,
  setUserServiceConfigurationUseCase
);
const userLegacyWebhookController = new UserLegacyWebhookController(
  getUserWebhookConfigurationUseCase,
  setUserWebhookConfigurationUseCase
);
const userRegistrationController = new UserRegistrationController(registerUserUseCase);
const userSetupController = new UserSetupController(
  completeInitialSetupUseCase,
  getInitialSetupStatusUseCase,
  validateTokensUseCase
);

export const userAuthRouter: Router = buildUserAuthRouter(userAuthController);
export const userInstancesRouter: Router = buildUserInstancesRouter(userInstancesController);
export const userLegacyServicesRouter: Router = buildUserLegacyServicesRouter(userLegacyServicesController);
export const userLegacyWebhookRouter: Router = buildUserLegacyWebhookRouter(userLegacyWebhookController);
export const userRegistrationRouter: Router = buildUserRegistrationRouter(userRegistrationController);
export const userSetupRouter: Router = buildUserSetupRouter(userSetupController);
