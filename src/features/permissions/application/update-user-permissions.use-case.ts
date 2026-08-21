import { Permissions } from '../domain/modelos/permissions.model';
import { UserPermissionsRepositoryPort } from '../domain/interfaces/user-permissions-repository.port';

export type UpdateUserPermissionsResult =
  | { kind: 'not_found' }
  | { kind: 'forbidden' }
  | { kind: 'admin_role_forbidden' }
  | { kind: 'ok'; userId: number; username: string; permissions: Permissions };

export class UpdateUserPermissionsUseCase {
  constructor(private readonly repository: UserPermissionsRepositoryPort) {}

  async execute(
    requestingAdminId: number,
    targetUserId: number,
    rawPermissions: Record<string, unknown>
  ): Promise<UpdateUserPermissionsResult> {
    const user = await this.repository.findById(targetUserId);
    if (!user) {
      return { kind: 'not_found' };
    }

    if (user.adminId !== requestingAdminId) {
      return { kind: 'forbidden' };
    }

    if (user.role === 'admin') {
      return { kind: 'admin_role_forbidden' };
    }

    const validPermissions: Permissions = {
      serviceManagement: Boolean(rawPermissions.serviceManagement),
      automaticAIDisableRules: Boolean(rawPermissions.automaticAIDisableRules),
      webhookConfiguration: Boolean(rawPermissions.webhookConfiguration),
      ticketControl: Boolean(rawPermissions.ticketControl),
      aiEnabledProjects: Boolean(rawPermissions.aiEnabledProjects),
      remoteServerIntegration: Boolean(rawPermissions.remoteServerIntegration)
    };

    await this.repository.updatePermissions(targetUserId, validPermissions);

    return { kind: 'ok', userId: user.id, username: user.username, permissions: validPermissions };
  }
}
