export interface LegacyUser {
  id: number;
  username: string;
  email: string;
  role: string;
  permissions: any;
  lastLogin?: Date | null;
  createdAt?: Date;
  isInitialSetupComplete: boolean | null;
}
