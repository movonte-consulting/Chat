import bcrypt from 'bcryptjs';
import { PasswordHasherPort } from '../../domain/interfaces/password-hasher.port';

export class BcryptPasswordHasherAdapter implements PasswordHasherPort {
  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }
}
