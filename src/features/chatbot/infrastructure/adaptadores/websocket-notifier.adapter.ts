import { JiraCommentSocketPayload, WebSocketNotifierPort } from '../../domain/interfaces/websocket-notifier.port';

export class WebSocketNotifierAdapter implements WebSocketNotifierPort {
  private io: any = null;

  /** Llamado externamente cuando el servidor WebSocket queda listo (routes/index.ts). */
  setServer(io: any): void {
    this.io = io;
  }

  private getServer(): any {
    if (this.io) return this.io;
    return (global as any).webSocketServer;
  }

  emitComment(issueKey: string, payload: JiraCommentSocketPayload): void {
    const server = this.getServer();
    if (server) {
      server.to(`ticket_${issueKey}`).emit('jira-comment', payload);
    }
  }
}
