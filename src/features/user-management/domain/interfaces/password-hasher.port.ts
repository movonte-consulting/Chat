export interface PasswordHasherPort {
  hash(plain: string): Promise<string>;
}
