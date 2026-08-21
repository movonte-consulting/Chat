import { StatusBasedDisablePort } from '../domain/interfaces/status-based-disable.port';
import { StatusBasedDisableConfig } from '../domain/modelos/status-based-disable-config.model';

export class GetStatusBasedDisableConfigUseCase {
  constructor(private readonly statusBasedDisable: StatusBasedDisablePort) {}

  execute(): StatusBasedDisableConfig {
    console.log('🔍 getStatusBasedDisableConfig called');
    const config = this.statusBasedDisable.getStatusBasedDisableConfig();
    console.log('📊 Current config:', config);
    return config;
  }
}
