import { Router, Request, Response } from 'express';

import { ServiceValidationServiceAdapter } from './adaptadores/service-validation-service.adapter';
import { UserLookupAdapter } from './adaptadores/user-lookup.adapter';
import { ServiceConfigurationRepository } from './repositorios/service-configuration.repository';

import { CreateValidationRequestUseCase } from '../application/user/create-validation-request.use-case';
import { GetUserValidationsUseCase } from '../application/user/get-user-validations.use-case';
import { GenerateProtectedTokenUseCase } from '../application/user/generate-protected-token.use-case';
import { GetPendingValidationsUseCase } from '../application/admin/get-pending-validations.use-case';
import { ApproveValidationUseCase } from '../application/admin/approve-validation.use-case';
import { RejectValidationUseCase } from '../application/admin/reject-validation.use-case';
import { ValidateProtectedTokenUseCase } from '../application/validate-protected-token.use-case';

import { UserServiceValidationController } from './controladores/user/user-service-validation.controller';
import { AdminServiceValidationController } from './controladores/admin/admin-service-validation.controller';
import { ProtectedTokenController } from './controladores/protected-token.controller';
import { buildUserServiceValidationRouter, buildAdminServiceValidationRouter } from './router';

// ── Infrastructure ───────────────────────────────────────────────────────────
const serviceValidationService = new ServiceValidationServiceAdapter();
const userLookup = new UserLookupAdapter();
const serviceConfigurationRepository = new ServiceConfigurationRepository();

// ── Application ───────────────────────────────────────────────────────────────
const createValidationRequestUseCase = new CreateValidationRequestUseCase(serviceValidationService, userLookup);
const getUserValidationsUseCase = new GetUserValidationsUseCase(serviceValidationService);
const generateProtectedTokenUseCase = new GenerateProtectedTokenUseCase(serviceConfigurationRepository, serviceValidationService);

const getPendingValidationsUseCase = new GetPendingValidationsUseCase(serviceConfigurationRepository, serviceValidationService);
const approveValidationUseCase = new ApproveValidationUseCase(serviceConfigurationRepository, serviceValidationService);
const rejectValidationUseCase = new RejectValidationUseCase(serviceConfigurationRepository);

const validateProtectedTokenUseCase = new ValidateProtectedTokenUseCase(serviceValidationService);

// ── Presentation ─────────────────────────────────────────────────────────────
const userController = new UserServiceValidationController(
  createValidationRequestUseCase,
  getUserValidationsUseCase,
  generateProtectedTokenUseCase
);
const adminController = new AdminServiceValidationController(
  getPendingValidationsUseCase,
  approveValidationUseCase,
  rejectValidationUseCase
);
const protectedTokenController = new ProtectedTokenController(validateProtectedTokenUseCase);

export const userServiceValidationRouter: Router = buildUserServiceValidationRouter(userController);
export const adminServiceValidationRouter: Router = buildAdminServiceValidationRouter(adminController);

/** Handler suelto para /api/service-validation/validate-token (prefijo propio, público, sin auth). */
export function validateProtectedToken(req: Request, res: Response): Promise<void> {
  return protectedTokenController.validateProtectedToken(req, res);
}
