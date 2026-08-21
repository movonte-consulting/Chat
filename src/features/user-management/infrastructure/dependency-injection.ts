import { Router } from 'express';

import { SequelizeUserRepository } from './repositorios/sequelize-user.repository';
import { BcryptPasswordHasherAdapter } from './adaptadores/bcrypt-password-hasher.adapter';

import { GetAllUsersUseCase } from '../application/get-all-users.use-case';
import { CreateUserUseCase } from '../application/create-user.use-case';
import { UpdateUserUseCase } from '../application/update-user.use-case';
import { ChangeUserPasswordUseCase } from '../application/change-user-password.use-case';
import { DeleteUserUseCase } from '../application/delete-user.use-case';

import { UserManagementController } from './controladores/user-management.controller';
import { buildUserManagementRouter } from './router';

// ── Infrastructure ───────────────────────────────────────────────────────────
const userRepository = new SequelizeUserRepository();
const passwordHasher = new BcryptPasswordHasherAdapter();

// ── Application ───────────────────────────────────────────────────────────────
const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const createUserUseCase = new CreateUserUseCase(userRepository, passwordHasher);
const updateUserUseCase = new UpdateUserUseCase(userRepository);
const changeUserPasswordUseCase = new ChangeUserPasswordUseCase(userRepository, passwordHasher);
const deleteUserUseCase = new DeleteUserUseCase(userRepository);

// ── Presentation ─────────────────────────────────────────────────────────────
const userManagementController = new UserManagementController(
  getAllUsersUseCase,
  createUserUseCase,
  updateUserUseCase,
  changeUserPasswordUseCase,
  deleteUserUseCase
);

export const userManagementRouter: Router = buildUserManagementRouter(userManagementController);
