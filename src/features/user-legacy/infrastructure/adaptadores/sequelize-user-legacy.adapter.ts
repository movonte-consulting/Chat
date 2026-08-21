import { User } from '../../../../models';
import { LegacyUserCredentialsPort, LegacyUserCredentialsRecord } from '../../domain/interfaces/legacy-user-credentials.port';
import { UserRegistrationRepositoryPort, RegisterUserInput } from '../../domain/interfaces/user-registration-repository.port';
import { InitialSetupRepositoryPort } from '../../domain/interfaces/initial-setup-repository.port';
import { LegacyUser } from '../../domain/modelos/legacy-user.model';
import { CompleteInitialSetupInput, InitialSetupStatus } from '../../domain/modelos/initial-setup.model';

function toCredentialsRecord(user: any): LegacyUserCredentialsRecord {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    password: user.password,
    role: user.role,
    permissions: user.permissions,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    isInitialSetupComplete: user.isInitialSetupComplete,
    createdAt: user.createdAt
  };
}

export class SequelizeUserLegacyAdapter
  implements LegacyUserCredentialsPort, UserRegistrationRepositoryPort, InitialSetupRepositoryPort {
  async findByUsername(username: string): Promise<LegacyUserCredentialsRecord | null> {
    const user = await User.findOne({ where: { username } });
    if (!user) return null;
    return toCredentialsRecord(user);
  }

  async findById(id: number): Promise<LegacyUserCredentialsRecord | null> {
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } as any });
    if (!user) return null;
    return toCredentialsRecord(user);
  }

  async updateLastLogin(id: number, date: Date): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) return;
    await user.update({ lastLogin: date });
  }

  async existsByUsername(username: string): Promise<boolean> {
    const existingUser = await User.findOne({ where: { username } });
    return !!existingUser;
  }

  async create(input: RegisterUserInput): Promise<LegacyUser> {
    const user = await User.create({
      username: input.username,
      email: input.email,
      password: input.hashedPassword,
      role: input.role,
      isActive: true,
      adminId: input.adminId,
      permissions: input.permissions
    } as any);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: (user as any).permissions,
      createdAt: user.createdAt,
      isInitialSetupComplete: user.isInitialSetupComplete ?? null
    };
  }

  async complete(userId: number, input: CompleteInitialSetupInput): Promise<void> {
    await User.update({
      jiraToken: input.jiraToken,
      jiraUrl: input.jiraUrl,
      openaiToken: input.openaiToken,
      isInitialSetupComplete: true,
      ...(input.organizationLogo ? { organizationLogo: input.organizationLogo } : {})
    } as any, {
      where: { id: userId }
    });
  }

  async getStatus(userId: number): Promise<InitialSetupStatus | null> {
    const user = await User.findByPk(userId, {
      attributes: ['isInitialSetupComplete', 'jiraToken', 'openaiToken']
    });
    if (!user) return null;

    return {
      isInitialSetupComplete: user.isInitialSetupComplete ?? null,
      jiraToken: user.jiraToken ?? null,
      openaiToken: user.openaiToken ?? null
    };
  }
}
