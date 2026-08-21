export type GetSessionInfoResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok'; data: { id: string; status: string; message: string } };

export class GetSessionInfoUseCase {
  execute(sessionId: string | undefined): GetSessionInfoResult {
    if (!sessionId) {
      return { kind: 'validation_error', message: 'sessionId es requerido' };
    }

    console.log('🔄 Obteniendo información de sesión:', sessionId);

    return {
      kind: 'ok',
      data: { id: sessionId, status: 'active', message: 'Sesión manejada por OpenAI backend' }
    };
  }
}
