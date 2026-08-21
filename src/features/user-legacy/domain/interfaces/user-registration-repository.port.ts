import { LegacyUser } from '../modelos/legacy-user.model';

export interface RegisterUserInput {
  username: string;
  email: string;
  hashedPassword: string;
  role: string;
  adminId: number;
  permissions: any;
}

export interface UserRegistrationRepositoryPort {
  existsByUsername(username: string): Promise<boolean>;
  create(input: RegisterUserInput): Promise<LegacyUser>;
}
