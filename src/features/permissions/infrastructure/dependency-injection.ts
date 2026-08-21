import { Router } from 'express';
import { UserPermissionsRepositoryAdapter } from './adaptadores/user-permissions-repository.adapter';
import { GetUserPermissionsUseCase } from '../application/get-user-permissions.use-case';
import { UpdateUserPermissionsUseCase } from '../application/update-user-permissions.use-case';
import { GetUsersWithPermissionsUseCase } from '../application/get-users-with-permissions.use-case';
import { PermissionsController } from './controladores/permissions.controller';
import { buildPermissionsRouter } from './router';

const userPermissionsRepository = new UserPermissionsRepositoryAdapter();

const getUserPermissionsUseCase = new GetUserPermissionsUseCase(userPermissionsRepository);
const updateUserPermissionsUseCase = new UpdateUserPermissionsUseCase(userPermissionsRepository);
const getUsersWithPermissionsUseCase = new GetUsersWithPermissionsUseCase(userPermissionsRepository);

const permissionsController = new PermissionsController(
  getUserPermissionsUseCase,
  updateUserPermissionsUseCase,
  getUsersWithPermissionsUseCase
);

export const permissionsRouter: Router = buildPermissionsRouter(permissionsController);
