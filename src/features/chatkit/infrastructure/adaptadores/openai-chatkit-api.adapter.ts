import { ChatKitOpenAiSessionPort } from '../../domain/interfaces/chatkit-openai-session.port';
import { ChatKitSession } from '../../domain/modelos/chatkit-session.model';

interface ChatKitSessionResponse {
  id: string;
  client_secret: string;
  expires_at: string;
}

interface ChatKitErrorResponse {
  error: {
    message: string;
    type: string;
  };
}

export class OpenAiChatKitApiAdapter implements ChatKitOpenAiSessionPort {
  async createSession(userId: string): Promise<ChatKitSession> {
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'chatkit_beta=v1'
      },
      body: JSON.stringify({
        workflow: { id: process.env.OPENAI_CHATKIT_WORKFLOW_ID },
        user: userId
      })
    });

    if (!response.ok) {
      const errorData = await response.json() as ChatKitErrorResponse;
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const session = await response.json() as ChatKitSessionResponse;
    return { sessionId: session.id, clientSecret: session.client_secret, expiresAt: session.expires_at };
  }

  async refreshSession(existingSecret: string): Promise<ChatKitSession> {
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'chatkit_beta=v1'
      },
      body: JSON.stringify({ client_secret: existingSecret })
    });

    if (!response.ok) {
      const errorData = await response.json() as ChatKitErrorResponse;
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const session = await response.json() as ChatKitSessionResponse;
    return { sessionId: session.id, clientSecret: session.client_secret, expiresAt: session.expires_at };
  }
}
