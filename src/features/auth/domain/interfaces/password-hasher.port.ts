export interface PasswordHasherPort {
  compare(plain: string, hashed: string): Promise<boolean>;
  hash(plain: string): Promise<string>;
}
