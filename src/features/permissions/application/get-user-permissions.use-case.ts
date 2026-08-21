import { DEFAULT_PERMISSIONS, Permissions } from '../domain/modelos/permissions.model';
import { UserPermissionsRepositoryPort } from '../domain/interfaces/user-permissions-repository.port';

export type GetUserPermissionsResult =
  | { kind: 'not_found' }
  | { kind: 'forbidden' }
  | { kind: 'ok'; userId: number; username: string; role: string; permissions: Permissions };

export class GetUserPermissionsUseCase {
  constructor(private readonly repository: UserPermissionsRepositoryPort) {}

  async execute(requestingAdminId: number, targetUserId: number): Promise<GetUserPermissionsResult> {
    const user = await this.repository.findById(targetUserId);
    if (!user) {
      return { kind: 'not_found' };
    }

    if (user.adminId !== requestingAdminId) {
      return { kind: 'forbidden' };
    }

    return {
      kind: 'ok',
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions || DEFAULT_PERMISSIONS
    };
  }
}
