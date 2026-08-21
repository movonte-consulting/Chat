import { HealthStatus } from '../domain/modelos/health-status.model';

export class GetHealthUseCase {
  execute(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Movonte API - Chatbot & Contact',
      version: '1.0.0',
      endpoints: {
        contact: '/api/contact',
        chatbot: '/api/chatbot/*',
        health: '/health'
      }
    };
  }
}
