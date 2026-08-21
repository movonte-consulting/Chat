import { Router } from 'express';

import { CorsServiceAdapter } from './adaptadores/cors-service.adapter';
import { GetCorsStatsUseCase } from '../application/get-cors-stats.use-case';
import { ReloadCorsUseCase } from '../application/reload-cors.use-case';
import { AddCorsDomainUseCase } from '../application/add-cors-domain.use-case';
import { RemoveCorsDomainUseCase } from '../application/remove-cors-domain.use-case';
import { CorsController } from './controladores/cors.controller';
import { buildCorsRouter } from './router';

const corsRegistry = new CorsServiceAdapter();

const getCorsStatsUseCase = new GetCorsStatsUseCase(corsRegistry);
const reloadCorsUseCase = new ReloadCorsUseCase(corsRegistry);
const addCorsDomainUseCase = new AddCorsDomainUseCase(corsRegistry);
const removeCorsDomainUseCase = new RemoveCorsDomainUseCase(corsRegistry);

const corsController = new CorsController(
  getCorsStatsUseCase,
  reloadCorsUseCase,
  addCorsDomainUseCase,
  removeCorsDomainUseCase
);

export const corsRouter: Router = buildCorsRouter(corsController);
