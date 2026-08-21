export interface ServiceOption {
  serviceId: string;
  serviceName: string;
  description?: string;
}

export interface SendResult {
  success: boolean;
  error?: string;
}

export interface WhatsAppSenderPort {
  sendText(phoneNumberId: string, toPhone: string, text: string): Promise<SendResult>;
  sendInteractiveServices(
    phoneNumberId: string,
    toPhone: string,
    services: ServiceOption[],
    headerText?: string,
    bodyText?: string
  ): Promise<SendResult>;
}
