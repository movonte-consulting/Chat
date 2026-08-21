import { UserCredentialsProviderPort } from '../domain/interfaces/user-credentials-provider.port';
import { UserAssistantCatalogPort } from '../domain/interfaces/user-assistant-catalog.port';

export type GetUserAssistantsResult =
  | { kind: 'missing_openai_token' }
  | { kind: 'ok'; data: any[] };

export class GetUserAssistantsUseCase {
  constructor(
    private readonly userCredentials: UserCredentialsProviderPort,
    private readonly userAssistantCatalog: UserAssistantCatalogPort
  ) {}

  async execute(userId: number): Promise<GetUserAssistantsResult> {
    const credentials = await this.userCredentials.getById(userId);
    if (!credentials || !credentials.openaiToken) {
      return { kind: 'missing_openai_token' };
    }

    const data = await this.userAssistantCatalog.listAssistants(credentials);

    return { kind: 'ok', data };
  }
}
