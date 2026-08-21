export interface StatusBasedDisableConfig {
  isEnabled: boolean;
  triggerStatuses: string[];
  lastUpdated: Date;
}
