import bcrypt from 'bcrypt';
import { PasswordVerifierPort } from '../../domain/interfaces/password-verifier.port';

/**
 * Preserva el comportamiento legacy exacto: si el hash bcrypt no coincide, cae a comparar
 * el password en texto plano contra el hash almacenado. Es un bug de seguridad real del
 * controller original — se mantiene tal cual, documentado, no se corrige en esta migración.
 */
export class BcryptPasswordVerifierAdapter implements PasswordVerifierPort {
  async verify(plain: string, hashed: string): Promise<boolean> {
    return (await bcrypt.compare(plain, hashed)) || plain === hashed;
  }
}
