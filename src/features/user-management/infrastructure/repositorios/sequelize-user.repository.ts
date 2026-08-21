import { Op } from 'sequelize';
import { User } from '../../../../models';
import { UserRepositoryPort, CreateUserInput, UpdateUserInput } from '../../domain/interfaces/user-repository.port';
import { ManagedUser } from '../../domain/modelos/managed-user.model';

function toManagedUser(user: any): ManagedUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    adminId: user.adminId
  };
}

export class SequelizeUserRepository implements UserRepositoryPort {
  async listByAdmin(adminId: number): Promise<ManagedUser[]> {
    const users = await User.findAll({
      where: { adminId },
      attributes: ['id', 'username', 'email', 'role', 'isActive', 'lastLogin', 'createdAt', 'adminId'],
      order: [['createdAt', 'DESC']]
    });
    return users.map(toManagedUser);
  }

  async findById(id: string): Promise<ManagedUser | null> {
    const user = await User.findByPk(id);
    if (!user) return null;
    return toManagedUser(user);
  }

  async existsByUsernameOrEmail(username: string, email: string): Promise<boolean> {
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] }
    });
    return !!existingUser;
  }

  async existsByUsernameOrEmailExcluding(id: string, username: string | undefined, email: string | undefined): Promise<boolean> {
    const existingUser = await User.findOne({
      where: {
        [Op.and]: [
          { id: { [Op.ne]: id } },
          {
            [Op.or]: [
              ...(username ? [{ username }] : []),
              ...(email ? [{ email }] : [])
            ]
          }
        ]
      }
    });
    return !!existingUser;
  }

  async create(input: CreateUserInput): Promise<ManagedUser> {
    const newUser = await User.create({
      username: input.username,
      email: input.email,
      password: input.hashedPassword,
      role: input.role,
      isActive: true,
      adminId: input.adminId
    });
    return toManagedUser(newUser);
  }

  async update(id: string, input: UpdateUserInput): Promise<ManagedUser> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    await user.update(input);
    return toManagedUser(user);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    await user.update({ password: hashedPassword });
  }

  async delete(id: string): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    await user.destroy();
  }
}
