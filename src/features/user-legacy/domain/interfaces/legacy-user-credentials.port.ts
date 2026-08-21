export interface LegacyUserCredentialsRecord {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  permissions: any;
  isActive: boolean;
  lastLogin: Date | null;
  isInitialSetupComplete: boolean | null;
  createdAt: Date;
}

export interface LegacyUserCredentialsPort {
  findByUsername(username: string): Promise<LegacyUserCredentialsRecord | null>;
  findById(id: number): Promise<LegacyUserCredentialsRecord | null>;
  updateLastLogin(id: number, date: Date): Promise<void>;
}
