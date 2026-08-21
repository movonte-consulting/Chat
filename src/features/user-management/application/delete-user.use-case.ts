import { UserRepositoryPort } from '../domain/interfaces/user-repository.port';

export type DeleteUserResult =
  | { kind: 'self_delete_forbidden' }
  | { kind: 'not_found' }
  | { kind: 'forbidden' }
  | { kind: 'ok' };

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(adminId: number, id: string): Promise<DeleteUserResult> {
    if (parseInt(id) === adminId) {
      return { kind: 'self_delete_forbidden' };
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      return { kind: 'not_found' };
    }

    if (user.adminId !== adminId) {
      return { kind: 'forbidden' };
    }

    await this.userRepository.delete(id);

    return { kind: 'ok' };
  }
}
