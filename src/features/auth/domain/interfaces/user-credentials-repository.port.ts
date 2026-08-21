export interface UserCredentialsRecord {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  lastLogin: Date | null;
  isInitialSetupComplete: boolean;
  jiraToken: string | null;
  openaiToken: string | null;
  organizationLogo?: string | null;
}

export interface UserCredentialsRepositoryPort {
  findByUsernameOrEmail(usernameOrEmail: string): Promise<UserCredentialsRecord | null>;
  findById(id: number): Promise<UserCredentialsRecord | null>;
  updateLastLogin(id: number, date: Date): Promise<void>;
  updatePassword(id: number, hashedPassword: string): Promise<void>;
  updateOrganizationLogo(id: number, organizationLogo: string | undefined): Promise<void>;
}
