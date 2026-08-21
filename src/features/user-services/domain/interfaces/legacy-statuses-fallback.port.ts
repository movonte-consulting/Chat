import { Request, Response } from 'express';

/** Delega la respuesta completa a getAvailableStatuses del feature webhook-admin. */
export interface LegacyStatusesFallbackPort {
  handle(req: Request, res: Response): Promise<void>;
}
