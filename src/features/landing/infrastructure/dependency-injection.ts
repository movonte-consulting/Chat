import { Router } from 'express';

import { GlobalJiraServiceAdapter } from './adaptadores/global-jira-service.adapter';
import { CreateTicketFromLandingUseCase } from '../application/create-ticket-from-landing.use-case';
import { ValidateLandingFormUseCase } from '../application/validate-landing-form.use-case';
import { GetLandingFormFieldsUseCase } from '../application/get-landing-form-fields.use-case';
import { LandingController } from './controladores/landing.controller';
import { buildLandingRouter } from './router';

const jiraContactIssueCreator = new GlobalJiraServiceAdapter();

const createTicketFromLandingUseCase = new CreateTicketFromLandingUseCase(jiraContactIssueCreator);
const validateLandingFormUseCase = new ValidateLandingFormUseCase();
const getLandingFormFieldsUseCase = new GetLandingFormFieldsUseCase();

const landingController = new LandingController(
  createTicketFromLandingUseCase,
  validateLandingFormUseCase,
  getLandingFormFieldsUseCase
);

export const landingRouter: Router = buildLandingRouter(landingController);
