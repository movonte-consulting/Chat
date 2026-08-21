export interface PasswordVerifierPort {
  /** Preserva el fallback legacy a texto plano si el hash bcrypt no coincide. */
  verify(plain: string, hashed: string): Promise<boolean>;
}
