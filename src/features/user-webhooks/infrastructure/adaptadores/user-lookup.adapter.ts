import { UserLookupPort } from '../../domain/interfaces/user-lookup.port';

export class UserLookupAdapter implements UserLookupPort {
  async exists(userId: number): Promise<boolean> {
    const { User } = await import('../../../../models');
    const user = await User.findByPk(userId);
    return !!user;
  }
}
