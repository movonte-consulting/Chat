export type ValidateTokensResult =
  | { kind: 'validation_error'; message: string }
  | {
      kind: 'ok';
      allValid: boolean;
      validation: {
        jiraToken: { isValid: boolean; message: string };
        openaiToken: { isValid: boolean; message: string };
      };
    };

export class ValidateTokensUseCase {
  execute(jiraToken: string | undefined, openaiToken: string | undefined): ValidateTokensResult {
    if (!jiraToken || !openaiToken) {
      return { kind: 'validation_error', message: 'Jira token y OpenAI token son requeridos' };
    }

    const validation = {
      jiraToken: {
        isValid: jiraToken.length > 10,
        message: jiraToken.length > 10 ? 'Token válido' : 'Token inválido'
      },
      openaiToken: {
        isValid: openaiToken.startsWith('sk-'),
        message: openaiToken.startsWith('sk-') ? 'Token válido' : 'Token inválido'
      }
    };

    const allValid = validation.jiraToken.isValid && validation.openaiToken.isValid;

    return { kind: 'ok', allValid, validation };
  }
}
