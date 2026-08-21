import { Request, Response } from 'express';
import { GetHealthUseCase } from '../../application/get-health.use-case';
import { GetDetailedHealthUseCase } from '../../application/get-detailed-health.use-case';

export class HealthController {
  constructor(
    private readonly getHealthUseCase: GetHealthUseCase,
    private readonly getDetailedHealthUseCase: GetDetailedHealthUseCase
  ) {}

  async healthCheck(req: Request, res: Response): Promise<void> {
    res.json(this.getHealthUseCase.execute());
  }

  async detailedHealth(req: Request, res: Response): Promise<void> {
    res.json(this.getDetailedHealthUseCase.execute());
  }
}
