import { Op } from 'sequelize';
import { User } from '../../../../models';
import { UserCredentialsRepositoryPort, UserCredentialsRecord } from '../../domain/interfaces/user-credentials-repository.port';

function toRecord(user: any): UserCredentialsRecord {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    password: user.password,
    role: user.role,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    isInitialSetupComplete: user.isInitialSetupComplete,
    jiraToken: user.jiraToken,
    openaiToken: user.openaiToken,
    organizationLogo: user.organizationLogo
  };
}

export class SequelizeUserCredentialsAdapter implements UserCredentialsRepositoryPort {
  async findByUsernameOrEmail(usernameOrEmail: string): Promise<UserCredentialsRecord | null> {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
      }
    });
    if (!user) return null;
    return toRecord(user);
  }

  async findById(id: number): Promise<UserCredentialsRecord | null> {
    const user = await User.findByPk(id);
    if (!user) return null;
    return toRecord(user);
  }

  async updateLastLogin(id: number, date: Date): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) return;
    await user.update({ lastLogin: date });
  }

  async updatePassword(id: number, hashedPassword: string): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) return;
    await user.update({ password: hashedPassword });
  }

  async updateOrganizationLogo(id: number, organizationLogo: string | undefined): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) return;
    await user.update({ organizationLogo } as any);
  }
}
