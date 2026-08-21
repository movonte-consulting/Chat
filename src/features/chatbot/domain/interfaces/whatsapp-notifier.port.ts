export interface WhatsAppNotifierPort {
  notify(issueKey: string, text: string): Promise<void>;
}
