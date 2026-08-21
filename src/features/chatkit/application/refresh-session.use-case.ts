import { ChatKitOpenAiSessionPort } from '../domain/interfaces/chatkit-openai-session.port';
import { ChatKitSession } from '../domain/modelos/chatkit-session.model';

export type RefreshSessionResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok'; data: ChatKitSession };

export class RefreshSessionUseCase {
  constructor(private readonly chatKitOpenAiSession: ChatKitOpenAiSessionPort) {}

  async execute(existingSecret: string | undefined, userId: string | undefined): Promise<RefreshSessionResult> {
    if (!existingSecret || !userId) {
      return { kind: 'validation_error', message: 'existingSecret y userId son requeridos' };
    }

    console.log('🔄 Refrescando sesión de ChatKit para usuario:', userId);

    const data = await this.chatKitOpenAiSession.refreshSession(existingSecret);
    console.log('✅ Sesión de ChatKit refrescada exitosamente');

    return { kind: 'ok', data };
  }
}
