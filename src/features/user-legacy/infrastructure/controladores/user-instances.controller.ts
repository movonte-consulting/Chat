import { Request, Response } from 'express';
import { GetUserInstancesUseCase } from '../../application/get-user-instances.use-case';
import { CreateInstanceUseCase } from '../../application/create-instance.use-case';
import { UpdateInstanceUseCase } from '../../application/update-instance.use-case';
import { DeleteInstanceUseCase } from '../../application/delete-instance.use-case';

export class UserInstancesController {
  constructor(
    private readonly getUserInstancesUseCase: GetUserInstancesUseCase,
    private readonly createInstanceUseCase: CreateInstanceUseCase,
    private readonly updateInstanceUseCase: UpdateInstanceUseCase,
    private readonly deleteInstanceUseCase: DeleteInstanceUseCase
  ) {}

  async getUserInstances(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const instances = await this.getUserInstancesUseCase.execute(req.user.id);

      res.json({ success: true, data: { instances } });
    } catch (error) {
      console.error('Error obteniendo instancias:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async createInstance(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const { instanceName, instanceDescription, settings } = req.body;
      const result = await this.createInstanceUseCase.execute(req.user.id, instanceName, instanceDescription, settings);

      if (result.kind === 'validation_error') {
        res.status(400).json({ success: false, error: result.message });
        return;
      }

      res.status(201).json({ success: true, data: { instance: result.data } });
    } catch (error) {
      console.error('Error creando instancia:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async updateInstance(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const { id } = req.params;
      const { instanceName, instanceDescription, isActive, settings } = req.body;
      await this.updateInstanceUseCase.execute(req.user.id, parseInt(id), instanceName, instanceDescription, isActive, settings);

      res.json({ success: true, message: 'Instancia actualizada correctamente' });
    } catch (error) {
      console.error('Error actualizando instancia:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async deleteInstance(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Usuario no autenticado' });
        return;
      }

      const { id } = req.params;
      await this.deleteInstanceUseCase.execute(req.user.id, parseInt(id));

      res.json({ success: true, message: 'Instancia eliminada correctamente' });
    } catch (error) {
      console.error('Error eliminando instancia:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}
