import { Router, Request, Response } from 'express';

import { SequelizeUserCredentialsAdapter } from './adaptadores/sequelize-user-credentials.adapter';
import { JwtTokenIssuerAdapter } from './adaptadores/jwt-token-issuer.adapter';
import { BcryptPasswordHasherAdapter } from './adaptadores/bcrypt-password-hasher.adapter';

import { LoginUseCase } from '../application/login.use-case';
import { GetProfileUseCase } from '../application/get-profile.use-case';
import { UpdateProfileUseCase } from '../application/update-profile.use-case';
import { ChangePasswordUseCase } from '../application/change-password.use-case';

import { AuthController } from './controladores/auth.controller';
import { buildAuthRouter } from './router';

// ── Infrastructure ───────────────────────────────────────────────────────────
const userCredentials = new SequelizeUserCredentialsAdapter();
const tokenIssuer = new JwtTokenIssuerAdapter();
const passwordHasher = new BcryptPasswordHasherAdapter();

// ── Application ───────────────────────────────────────────────────────────────
const loginUseCase = new LoginUseCase(userCredentials, tokenIssuer, passwordHasher);
const getProfileUseCase = new GetProfileUseCase(userCredentials);
const updateProfileUseCase = new UpdateProfileUseCase(userCredentials);
const changePasswordUseCase = new ChangePasswordUseCase(userCredentials, passwordHasher);

// ── Presentation ─────────────────────────────────────────────────────────────
const authController = new AuthController(loginUseCase, getProfileUseCase, updateProfileUseCase, changePasswordUseCase);

export const authRouter: Router = buildAuthRouter(authController);

/** Handler suelto para consumidores que invocan login() directamente (p.ej. scripts de prueba). */
export function login(req: Request, res: Response): Promise<void> {
  return authController.login(req, res);
}
