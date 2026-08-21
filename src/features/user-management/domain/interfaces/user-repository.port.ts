import { ManagedUser } from '../modelos/managed-user.model';

export interface CreateUserInput {
  username: string;
  email: string;
  hashedPassword: string;
  role: 'admin' | 'user';
  adminId: number;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
}

export interface UserRepositoryPort {
  listByAdmin(adminId: number): Promise<ManagedUser[]>;
  findById(id: string): Promise<ManagedUser | null>;
  existsByUsernameOrEmail(username: string, email: string): Promise<boolean>;
  existsByUsernameOrEmailExcluding(id: string, username: string | undefined, email: string | undefined): Promise<boolean>;
  create(input: CreateUserInput): Promise<ManagedUser>;
  update(id: string, input: UpdateUserInput): Promise<ManagedUser>;
  updatePassword(id: string, hashedPassword: string): Promise<void>;
  delete(id: string): Promise<void>;
}
