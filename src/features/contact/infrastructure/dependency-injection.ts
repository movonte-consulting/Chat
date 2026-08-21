import { Router } from 'express';

import { GlobalJiraServiceAdapter } from './adaptadores/global-jira-service.adapter';
import { SubmitContactFormUseCase } from '../application/submit-contact-form.use-case';
import { TestJiraConnectionUseCase } from '../application/test-jira-connection.use-case';
import { ContactController } from './controladores/contact.controller';
import { buildContactRouter } from './router';

const jiraContactIssueCreator = new GlobalJiraServiceAdapter();

const submitContactFormUseCase = new SubmitContactFormUseCase(jiraContactIssueCreator);
const testJiraConnectionUseCase = new TestJiraConnectionUseCase(jiraContactIssueCreator);

const contactController = new ContactController(submitContactFormUseCase, testJiraConnectionUseCase);

export const contactRouter: Router = buildContactRouter(contactController);
