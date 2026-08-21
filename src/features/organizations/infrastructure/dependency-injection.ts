import { Router } from 'express';
import { OrganizationUserRepositoryAdapter } from './adaptadores/organization-user-repository.adapter';
import { OrganizationLogoRepositoryAdapter } from './adaptadores/organization-logo-repository.adapter';
import { GetOrganizationsUseCase } from '../application/get-organizations.use-case';
import { OrganizationsController } from './controladores/organizations.controller';
import { buildOrganizationsRouter } from './router';

const organizationUserRepository = new OrganizationUserRepositoryAdapter();
const organizationLogoRepository = new OrganizationLogoRepositoryAdapter();
const getOrganizationsUseCase = new GetOrganizationsUseCase(organizationUserRepository, organizationLogoRepository);
const organizationsController = new OrganizationsController(getOrganizationsUseCase);

export const organizationsRouter: Router = buildOrganizationsRouter(organizationsController);
