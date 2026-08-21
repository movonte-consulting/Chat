export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
}

export interface ServiceConfig {
  serviceId: string;
  serviceName: string;
  assistantId: string | null;
  assistantName: string | null;
  isActive: boolean;
  configuration: Record<string, any>;
  lastUpdated: Date | string | null;
}

export interface TicketFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  source: string;
  serviceId: string;
  serviceName: string;
  projectKey: string;
}

/** Extrae el projectKey de la configuración del servicio (unified_configurations.configuration). */
export function getProjectKeyFromConfig(serviceConfig: ServiceConfig): string | null {
  return serviceConfig.configuration?.projectKey || null;
}

/** Construye las labels del ticket de Jira a partir de los datos del formulario. */
export function buildTicketLabels(formData: TicketFormData): string[] {
  const normalizeLabel = (s: string) => s.replace(/\s+/g, '-').toLowerCase();
  const baseLabels = ['service-contact', 'widget-chat', normalizeLabel(`service-${formData.serviceId}`)];
  const source = formData.source && formData.source !== 'unknown' ? normalizeLabel(formData.source) : 'unknown';
  return [...new Set([...baseLabels, source])];
}

/** Formatea la descripción del ticket de contacto de servicio en Atlassian Document Format. */
export function formatTicketDescriptionADF(formData: TicketFormData): any {
  const lines = [
    `Contact from service: ${formData.serviceName || formData.serviceId}`,
    '',
    `Customer Information:`,
    `• Name: ${formData.name}`,
    `• Email: ${formData.email}`,
    formData.phone ? `• Phone: ${formData.phone}` : null,
    formData.company ? `• Company: ${formData.company}` : null,
    '',
    `Service Details:`,
    `• Service ID: ${formData.serviceId}`,
    `• Service Name: ${formData.serviceName || 'N/A'}`,
    `• Project Key: ${formData.projectKey}`,
    `• Source: ${formData.source || 'unknown'}`,
    '',
    formData.message ? `Message: ${formData.message}` : 'No additional message provided',
    '',
    `Created via widget integration for service ${formData.serviceId}`
  ].filter(Boolean) as string[];

  return {
    version: 1 as const,
    type: 'doc' as const,
    content: lines.map((text) => ({
      type: 'paragraph' as const,
      content: text
        ? [{ type: 'text' as const, text }]
        : undefined
    }))
  };
}
