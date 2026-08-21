import { StatusBasedDisablePort } from '../domain/interfaces/status-based-disable.port';

export type ConfigureStatusBasedDisableResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok'; data: { isEnabled: boolean; triggerStatuses: string[]; lastUpdated: string } };

export class ConfigureStatusBasedDisableUseCase {
  constructor(private readonly statusBasedDisable: StatusBasedDisablePort) {}

  async execute(isEnabled: unknown, triggerStatuses: unknown): Promise<ConfigureStatusBasedDisableResult> {
    console.log('🔧 configureStatusBasedDisable called');
    console.log('🔍 Parsed data:', { isEnabled, triggerStatuses });

    if (typeof isEnabled !== 'boolean') {
      console.error('❌ isEnabled is not boolean:', typeof isEnabled, isEnabled);
      return { kind: 'validation_error', message: 'isEnabled debe ser un booleano' };
    }

    if (!Array.isArray(triggerStatuses)) {
      console.error('❌ triggerStatuses is not array:', typeof triggerStatuses, triggerStatuses);
      return { kind: 'validation_error', message: 'triggerStatuses debe ser un array' };
    }

    console.log(`🔧 Configurando deshabilitación basada en estados:`, { isEnabled, triggerStatuses });

    await this.statusBasedDisable.setStatusBasedDisableConfig(isEnabled, triggerStatuses);

    const responseData = {
      isEnabled,
      triggerStatuses,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ Configuration saved, sending response:', responseData);

    return { kind: 'ok', data: responseData };
  }
}
