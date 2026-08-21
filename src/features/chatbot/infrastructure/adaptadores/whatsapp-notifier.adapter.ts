import { WhatsAppNotifierPort } from '../../domain/interfaces/whatsapp-notifier.port';

export class WhatsAppNotifierAdapter implements WhatsAppNotifierPort {
  async notify(issueKey: string, text: string): Promise<void> {
    const { notifyFromJira } = await import('../../../../features/whatsapp');
    await notifyFromJira(issueKey, text);
  }
}
