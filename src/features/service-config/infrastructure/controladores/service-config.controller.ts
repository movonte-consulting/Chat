import { Request, Response } from 'express';
import '../../../../middleware/auth';
import { GetServiceConfigurationUseCase } from '../../application/get-service-configuration.use-case';
import { UpdateServiceConfigurationUseCase } from '../../application/update-service-configuration.use-case';
import { ToggleServiceUseCase } from '../../application/toggle-service.use-case';
import { AddServiceUseCase } from '../../application/add-service.use-case';
import { RemoveServiceUseCase } from '../../application/remove-service.use-case';
import { GetActiveAssistantForServiceUseCase } from '../../application/get-active-assistant-for-service.use-case';

export class ServiceConfigController {
  constructor(
    private readonly getServiceConfigurationUseCase: GetServiceConfigurationUseCase,
    private readonly updateServiceConfigurationUseCase: UpdateServiceConfigurationUseCase,
    private readonly toggleServiceUseCase: ToggleServiceUseCase,
    private readonly addServiceUseCase: AddServiceUseCase,
    private readonly removeServiceUseCase: RemoveServiceUseCase,
    private readonly getActiveAssistantForServiceUseCase: GetActiveAssistantForServiceUseCase
  ) {}

  async getServiceConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const config = await this.getServiceConfigurationUseCase.execute(serviceId, req.user?.id || 1);

      if (!config) {
        res.status(404).json({ success: false, error: `Servicio '${serviceId}' no encontrado` });
        return;
      }

      res.json({ success: true, data: config, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('❌ Error obteniendo configuración del servicio:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async updateServiceConfiguration(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const { assistantId, assistantName } = req.body;

      if (!assistantId || !assistantName) {
        res.status(400).json({ success: false, error: 'Se requiere assistantId y assistantName' });
        return;
      }

      const result = await this.updateServiceConfigurationUseCase.execute(serviceId, req.user?.id || 1, assistantId, assistantName);

      switch (result.kind) {
        case 'assistant_not_found':
          res.status(400).json({ success: false, error: 'El asistente especificado no existe' });
          return;
        case 'service_not_found':
          res.status(404).json({ success: false, error: `Servicio '${serviceId}' no encontrado` });
          return;
        case 'ok':
          console.log(`✅ Configuración actualizada para ${serviceId}: ${assistantName}`);
          res.json({
            success: true,
            message: `Configuración actualizada para ${serviceId}`,
            data: {
              serviceId: result.serviceId,
              assistantId: result.assistantId,
              assistantName: result.assistantName,
              lastUpdated: result.lastUpdated
            },
            timestamp: new Date().toISOString()
          });
          return;
      }
    } catch (error) {
      console.error('❌ Error actualizando configuración del servicio:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async toggleService(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        res.status(400).json({ success: false, error: 'Se requiere isActive como boolean' });
        return;
      }

      const result = this.toggleServiceUseCase.execute(serviceId, isActive);

      if (result.kind === 'not_found') {
        res.status(404).json({ success: false, error: `Servicio '${serviceId}' no encontrado` });
        return;
      }

      res.json({
        success: true,
        message: `Servicio ${serviceId} ${isActive ? 'activado' : 'desactivado'}`,
        data: result.config,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error cambiando estado del servicio:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async addService(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId, serviceName, assistantId, assistantName } = req.body;

      if (!serviceId || !serviceName || !assistantId || !assistantName) {
        res.status(400).json({ success: false, error: 'Se requieren serviceId, serviceName, assistantId y assistantName' });
        return;
      }

      const result = await this.addServiceUseCase.execute(serviceId, serviceName, assistantId, assistantName);

      switch (result.kind) {
        case 'assistant_not_found':
          res.status(400).json({ success: false, error: 'El asistente especificado no existe' });
          return;
        case 'already_exists':
          res.status(400).json({ success: false, error: `El servicio '${serviceId}' ya existe` });
          return;
        case 'add_failed':
          res.status(500).json({ success: false, error: 'Error interno al agregar servicio' });
          return;
        case 'ok':
          res.json({
            success: true,
            message: `Servicio '${serviceName}' agregado exitosamente`,
            data: result.config,
            timestamp: new Date().toISOString()
          });
          return;
      }
    } catch (error) {
      console.error('❌ Error agregando servicio:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  async removeService(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const success = this.removeServiceUseCase.execute(serviceId);

      if (success) {
        res.json({ success: true, message: `Servicio '${serviceId}' eliminado exitosamente`, timestamp: new Date().toISOString() });
      } else {
        res.status(404).json({ success: false, error: `Servicio '${serviceId}' no encontrado` });
      }
    } catch (error) {
      console.error('❌ Error eliminando servicio:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }

  /** Ruta pública (sin auth) — /api/services/:serviceId/assistant */
  async getActiveAssistantForService(req: Request, res: Response): Promise<void> {
    try {
      const { serviceId } = req.params;
      const result = this.getActiveAssistantForServiceUseCase.execute(serviceId);

      if (!result) {
        res.status(404).json({ success: false, error: `Servicio '${serviceId}' no disponible` });
        return;
      }

      res.json({ success: true, data: result, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('❌ Error obteniendo asistente activo:', error);
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Error desconocido' });
    }
  }
}
