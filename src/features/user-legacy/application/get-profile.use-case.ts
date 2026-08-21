import { LegacyUserCredentialsPort } from '../domain/interfaces/legacy-user-credentials.port';

export type GetProfileResult =
  | { kind: 'not_found' }
  | {
      kind: 'ok';
      data: {
        id: number;
        username: string;
        email: string;
        role: string;
        permissions: any;
        lastLogin: Date | null;
        createdAt: Date;
      };
    };

export class GetProfileUseCase {
  constructor(private readonly userCredentials: LegacyUserCredentialsPort) {}

  async execute(userId: number): Promise<GetProfileResult> {
    const user = await this.userCredentials.findById(userId);
    if (!user) {
      return { kind: 'not_found' };
    }

    return {
      kind: 'ok',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    };
  }
}
