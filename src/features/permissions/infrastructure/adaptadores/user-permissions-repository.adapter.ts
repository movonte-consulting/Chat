import { User } from '../../../../models';
import { Permissions } from '../../domain/modelos/permissions.model';
import { UserPermissionsRepositoryPort, UserRecordForPermissions } from '../../domain/interfaces/user-permissions-repository.port';

export class UserPermissionsRepositoryAdapter implements UserPermissionsRepositoryPort {
  async findById(userId: number): Promise<UserRecordForPermissions | null> {
    const user = await User.findByPk(userId);
    return user ? this.toRecord(user) : null;
  }

  async updatePermissions(userId: number, permissions: Permissions): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) return;
    await user.update({ permissions });
  }

  async listUsersManagedBy(adminId: number): Promise<UserRecordForPermissions[]> {
    const users = await User.findAll({
      where: { role: 'user', adminId },
      attributes: ['id', 'username', 'email', 'isActive', 'permissions', 'lastLogin', 'adminId'],
      order: [['username', 'ASC']]
    });
    return users.map((u: any) => this.toRecord(u));
  }

  private toRecord(u: any): UserRecordForPermissions {
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      isActive: u.isActive,
      lastLogin: u.lastLogin ?? null,
      adminId: u.adminId ?? null,
      permissions: u.permissions ?? null
    };
  }
}
