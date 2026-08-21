import { Request, Response } from 'express';
import { LegacyStatusesFallbackPort } from '../../domain/interfaces/legacy-statuses-fallback.port';

export class LegacyStatusesFallbackAdapter implements LegacyStatusesFallbackPort {
  async handle(req: Request, res: Response): Promise<void> {
    const { getAvailableStatuses } = await import('../../../webhook-admin');
    return getAvailableStatuses(req, res);
  }
}
