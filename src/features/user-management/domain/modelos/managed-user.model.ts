export interface ManagedUser {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt?: Date;
  adminId: number | null;
}
