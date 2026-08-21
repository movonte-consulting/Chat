export interface Permissions {
  serviceManagement: boolean;
  automaticAIDisableRules: boolean;
  webhookConfiguration: boolean;
  ticketControl: boolean;
  aiEnabledProjects: boolean;
  remoteServerIntegration: boolean;
}

export const DEFAULT_PERMISSIONS: Permissions = {
  serviceManagement: false,
  automaticAIDisableRules: false,
  webhookConfiguration: false,
  ticketControl: false,
  aiEnabledProjects: false,
  remoteServerIntegration: false
};

export interface UserWithPermissionsSummary {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  lastLogin: Date | null;
  permissions: Permissions;
}
