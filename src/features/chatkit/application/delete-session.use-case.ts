export type DeleteSessionResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok' };

export class DeleteSessionUseCase {
  execute(sessionId: string | undefined): DeleteSessionResult {
    if (!sessionId) {
      return { kind: 'validation_error', message: 'sessionId es requerido' };
    }

    console.log('🔄 Eliminando sesión:', sessionId);
    console.log('✅ Sesión marcada para eliminación (manejada por OpenAI)');

    return { kind: 'ok' };
  }
}
