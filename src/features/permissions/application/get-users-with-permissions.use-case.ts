import { DEFAULT_PERMISSIONS, UserWithPermissionsSummary } from '../domain/modelos/permissions.model';
import { UserPermissionsRepositoryPort } from '../domain/interfaces/user-permissions-repository.port';

export class GetUsersWithPermissionsUseCase {
  constructor(private readonly repository: UserPermissionsRepositoryPort) {}

  async execute(adminId: number): Promise<UserWithPermissionsSummary[]> {
    const users = await this.repository.listUsersManagedBy(adminId);

    return users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      isActive: u.isActive,
      lastLogin: u.lastLogin,
      permissions: u.permissions || DEFAULT_PERMISSIONS
    }));
  }
}
