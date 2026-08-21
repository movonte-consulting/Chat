import { Request, Response } from 'express';
import '../../../../middleware/auth';
import { GetOrganizationsUseCase } from '../../application/get-organizations.use-case';

export class OrganizationsController {
  constructor(private readonly getOrganizationsUseCase: GetOrganizationsUseCase) {}

  async getOrganizations(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin' || req.user.id !== 1) {
        res.status(403).json({ success: false, error: 'Acceso denegado' });
        return;
      }

      const organizations = await this.getOrganizationsUseCase.execute();
      res.json({ success: true, data: { organizations } });
    } catch (error) {
      console.error('Error listando organizaciones:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}
