import { TicketDisableRegistryPort } from '../domain/interfaces/ticket-disable-registry.port';
import { DisabledTicketInfo } from '../domain/modelos/disabled-ticket-info.model';

export type CheckAssistantStatusResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok'; isDisabled: boolean; disabledInfo: DisabledTicketInfo | null };

export class CheckAssistantStatusUseCase {
  constructor(private readonly ticketDisableRegistry: TicketDisableRegistryPort) {}

  execute(issueKey: unknown): CheckAssistantStatusResult {
    if (!issueKey || typeof issueKey !== 'string') {
      return { kind: 'validation_error', message: 'Missing or invalid issueKey parameter' };
    }

    const isDisabled = this.ticketDisableRegistry.isTicketDisabled(issueKey);
    const disabledInfo = isDisabled ? this.ticketDisableRegistry.getDisabledTicketInfo(issueKey) : null;

    return { kind: 'ok', isDisabled, disabledInfo };
  }
}
