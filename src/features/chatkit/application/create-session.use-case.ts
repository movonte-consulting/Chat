import { ChatKitOpenAiSessionPort } from '../domain/interfaces/chatkit-openai-session.port';
import { ChatKitSession } from '../domain/modelos/chatkit-session.model';

export type CreateSessionResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok'; data: ChatKitSession };

export class CreateSessionUseCase {
  constructor(private readonly chatKitOpenAiSession: ChatKitOpenAiSessionPort) {}

  async execute(userId: string | undefined, username: string | undefined): Promise<CreateSessionResult> {
    if (!userId || !username) {
      return { kind: 'validation_error', message: 'userId y username son requeridos' };
    }

    console.log('🔄 Creando sesión de ChatKit para usuario:', username);

    const data = await this.chatKitOpenAiSession.createSession(userId.toString());
    console.log('✅ Sesión de ChatKit creada exitosamente:', data.sessionId);

    return { kind: 'ok', data };
  }
}
