import { Router } from 'express';

import { ProcessEnvConfigAdapter } from './adaptadores/process-env-config.adapter';
import { GetHealthUseCase } from '../application/get-health.use-case';
import { GetDetailedHealthUseCase } from '../application/get-detailed-health.use-case';
import { HealthController } from './controladores/health.controller';
import { buildHealthRouter } from './router';

const environmentConfig = new ProcessEnvConfigAdapter();

const getHealthUseCase = new GetHealthUseCase();
const getDetailedHealthUseCase = new GetDetailedHealthUseCase(environmentConfig);

const healthController = new HealthController(getHealthUseCase, getDetailedHealthUseCase);

export const healthRouter: Router = buildHealthRouter(healthController);
