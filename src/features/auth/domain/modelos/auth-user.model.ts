export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: Date | null;
  isInitialSetupComplete: boolean;
  organizationLogo?: string | null;
}
