import { UserCredentialsRepositoryPort } from '../domain/interfaces/user-credentials-repository.port';
import { AuthUser } from '../domain/modelos/auth-user.model';

export type UpdateProfileResult =
  | { kind: 'not_found' }
  | { kind: 'ok'; user: AuthUser };

export class UpdateProfileUseCase {
  constructor(private readonly userCredentials: UserCredentialsRepositoryPort) {}

  async execute(userId: number, organizationLogo: string | undefined): Promise<UpdateProfileResult> {
    const user = await this.userCredentials.findById(userId);
    if (!user) {
      return { kind: 'not_found' };
    }

    if (typeof organizationLogo !== 'undefined') {
      await this.userCredentials.updateOrganizationLogo(userId, organizationLogo);
    }

    const updated = await this.userCredentials.findById(userId);

    return {
      kind: 'ok',
      user: {
        id: updated!.id,
        username: updated!.username,
        email: updated!.email,
        role: updated!.role,
        isActive: updated!.isActive,
        lastLogin: updated!.lastLogin,
        isInitialSetupComplete: updated!.isInitialSetupComplete,
        organizationLogo: updated!.organizationLogo
      }
    };
  }
}
