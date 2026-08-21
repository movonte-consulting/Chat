import { PublicActiveAssistantRepositoryPort, PublicActiveAssistant } from '../domain/interfaces/public-active-assistant-repository.port';

export type GetActiveAssistantForUserServiceResult =
  | { kind: 'not_found' }
  | { kind: 'ok'; data: PublicActiveAssistant };

export class GetActiveAssistantForUserServiceUseCase {
  constructor(private readonly publicActiveAssistantRepository: PublicActiveAssistantRepositoryPort) {}

  async execute(serviceId: string): Promise<GetActiveAssistantForUserServiceResult> {
    const data = await this.publicActiveAssistantRepository.findActiveByServiceId(serviceId);
    if (!data) {
      return { kind: 'not_found' };
    }

    return { kind: 'ok', data };
  }
}
