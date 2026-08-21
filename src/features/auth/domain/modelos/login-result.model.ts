export interface LoginResult {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    lastLogin: Date | null;
    isInitialSetupComplete: boolean;
  };
  requiresInitialSetup: boolean;
}
