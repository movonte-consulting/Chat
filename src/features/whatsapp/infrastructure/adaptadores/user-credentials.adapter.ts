import { User } from '../../../../models';
import { UserCredentialsProviderPort } from '../../domain/interfaces/user-credentials-provider.port';

export class UserCredentialsAdapter implements UserCredentialsProviderPort {
  async getOpenAIToken(userId: number): Promise<string | null> {
    const user = await User.findByPk(userId);
    return user?.openaiToken ?? null;
  }
}
