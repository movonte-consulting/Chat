import { UserLookupPort, UserLookupResult } from '../../domain/interfaces/user/user-lookup.port';

export class UserLookupAdapter implements UserLookupPort {
  async findAdminIdForUser(userId: number): Promise<UserLookupResult> {
    const { User } = await import('../../../../models');
    const user = await User.findByPk(userId);
    if (!user) return { exists: false, adminId: undefined };
    return { exists: true, adminId: (user as any).adminId };
  }
}
