import { StatusBasedDisableConfig } from '../modelos/status-based-disable-config.model';

export interface StatusBasedDisablePort {
  getStatusBasedDisableConfig(): StatusBasedDisableConfig;
  setStatusBasedDisableConfig(isEnabled: boolean, triggerStatuses: string[]): Promise<void>;
}
