/**
 * Pure business rules for routing an incoming WhatsApp message to a service.
 * No IO — services/keywords are supplied by the caller (via RoutableServiceProviderPort).
 */

export interface RoutableService {
  serviceId: string;
  serviceName: string;
  keywords: string[];
}

export interface ServiceSelection {
  serviceId: string;
  serviceName: string;
}

export const RESET_KEYWORDS = ['menu', 'inicio', 'reiniciar', 'reset', 'volver', 'start'];

export function isResetKeyword(text: string): boolean {
  return RESET_KEYWORDS.includes(text.trim().toLowerCase());
}

/**
 * Detect if the user message is a selection from the assistant list.
 * @param strictFirstContact - When true (first contact): only accept number 1..N or exact
 * service name. No keyword/substring match, so "hola" or "quiero info" won't create a
 * ticket and the list is always shown first.
 */
export function parseServiceSelection(
  services: RoutableService[],
  messageText: string,
  strictFirstContact = true
): ServiceSelection | null {
  const normalized = messageText.trim().toLowerCase();
  if (!normalized || services.length === 0) return null;

  const num = parseInt(normalized, 10);
  if (!Number.isNaN(num) && num >= 1 && num <= services.length) {
    const svc = services[num - 1];
    return { serviceId: svc.serviceId, serviceName: svc.serviceName };
  }

  for (const svc of services) {
    const nameNorm = svc.serviceName.trim().toLowerCase();
    if (nameNorm && normalized === nameNorm) return { serviceId: svc.serviceId, serviceName: svc.serviceName };
    if (!strictFirstContact) {
      if (nameNorm && normalized.includes(nameNorm)) return { serviceId: svc.serviceId, serviceName: svc.serviceName };
      for (const kw of svc.keywords) {
        if (kw && (normalized === kw || normalized.includes(kw))) return { serviceId: svc.serviceId, serviceName: svc.serviceName };
      }
    }
  }
  return null;
}
