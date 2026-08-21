import { Permissions } from '../modelos/permissions.model';

export interface UserRecordForPermissions {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: Date | null;
  adminId: number | null;
  permissions: Permissions | null;
}

export interface UserPermissionsRepositoryPort {
  findById(userId: number): Promise<UserRecordForPermissions | null>;
  updatePermissions(userId: number, permissions: Permissions): Promise<void>;
  listUsersManagedBy(adminId: number): Promise<UserRecordForPermissions[]>;
}
