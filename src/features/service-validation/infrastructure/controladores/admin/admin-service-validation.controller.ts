import { Request, Response } from 'express';
import { GetPendingValidationsUseCase } from '../../../application/admin/get-pending-validations.use-case';
import { ApproveValidationUseCase } from '../../../application/admin/approve-validation.use-case';
import { RejectValidationUseCase } from '../../../application/admin/reject-validation.use-case';

function isAdmin(req: Request): boolean {
  return !!req.user && req.user.role === 'admin';
}

export class AdminServiceValidationController {
  constructor(
    private readonly getPendingValidationsUseCase: GetPendingValidationsUseCase,
    private readonly approveValidationUseCase: ApproveValidationUseCase,
    private readonly rejectValidationUseCase: RejectValidationUseCase
  ) {}

  public async getPendingValidations(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }
      if (!isAdmin(req)) {
        res.status(403).json({ success: false, error: 'Acceso denegado. Solo administradores.' });
        return;
      }

      const validations = await this.getPendingValidationsUseCase.execute(req.user.id);

      res.json({ success: true, data: { validations, count: validations.length } });
    } catch (error) {
      console.error('❌ Error getting pending validations:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error interno del servidor' });
    }
  }

  public async approveValidation(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }
      if (!isAdmin(req)) {
        res.status(403).json({ success: false, error: 'Acceso denegado. Solo administradores.' });
        return;
      }

      const { id } = req.params;
      const { adminNotes } = req.body;

      const result = await this.approveValidationUseCase.execute(id, req.user.id, adminNotes);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: 'Servicio no encontrado' });
        return;
      }
      if (result.kind === 'forbidden') {
        res.status(403).json({
          success: false,
          error: 'No tienes permisos para aprobar este servicio. Solo puedes aprobar servicios de usuarios que creaste.'
        });
        return;
      }
      if (result.kind === 'already_decided') {
        res.status(400).json({
          success: false,
          error: `El servicio ya ha sido ${result.approvalStatus === 'approved' ? 'aprobado' : 'rechazado'}`
        });
        return;
      }

      res.json({
        success: true,
        message: `Servicio aprobado exitosamente${result.requestedDomain ? `. CORS configurado automáticamente para el dominio: ${result.requestedDomain}` : ''}`,
        data: {
          id: Number(id),
          serviceId: result.serviceId,
          serviceName: result.serviceName,
          approvalStatus: 'approved',
          adminNotes: result.adminNotes
        }
      });
    } catch (error) {
      console.error('❌ Error approving validation:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error interno del servidor' });
    }
  }

  public async rejectValidation(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }
      if (!isAdmin(req)) {
        res.status(403).json({ success: false, error: 'Acceso denegado. Solo administradores.' });
        return;
      }

      const { id } = req.params;
      const { adminNotes } = req.body;

      const result = await this.rejectValidationUseCase.execute(id, req.user.id, adminNotes);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }
      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: 'Servicio no encontrado' });
        return;
      }
      if (result.kind === 'forbidden') {
        res.status(403).json({
          success: false,
          error: 'No tienes permisos para rechazar este servicio. Solo puedes rechazar servicios de usuarios que creaste.'
        });
        return;
      }
      if (result.kind === 'already_decided') {
        res.status(400).json({
          success: false,
          error: `El servicio ya ha sido ${result.approvalStatus === 'approved' ? 'aprobado' : 'rechazado'}`
        });
        return;
      }

      res.json({
        success: true,
        message: 'Solicitud de validación rechazada.',
        data: {
          id: Number(id),
          serviceId: result.serviceId,
          serviceName: result.serviceName,
          approvalStatus: 'rejected',
          adminNotes: result.adminNotes
        }
      });
    } catch (error) {
      console.error('❌ Error rejecting validation:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error interno del servidor' });
    }
  }
}
