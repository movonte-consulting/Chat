import { DatabaseService } from './database_service';

interface DisabledTicket {
  issueKey: string;
  reason: string;
  disabledAt: Date;
  disabledBy: string;
}

export class TicketDisableRegistry {
  private static instance: TicketDisableRegistry;
  private disabledTickets: Map<string, DisabledTicket> = new Map();
  private dbService: DatabaseService;

  private constructor() {
    this.dbService = DatabaseService.getInstance();
    this.loadDisabledTicketsFromDatabase();
  }

  public static getInstance(): TicketDisableRegistry {
    if (!TicketDisableRegistry.instance) {
      TicketDisableRegistry.instance = new TicketDisableRegistry();
    }
    return TicketDisableRegistry.instance;
  }

  // Cargar tickets deshabilitados desde base de datos
  private async loadDisabledTicketsFromDatabase(): Promise<void> {
    try {
      console.log('🔄 Cargando tickets deshabilitados desde base de datos...');
      const disabledTickets = await this.dbService.getAllDisabledTickets();

      if (disabledTickets.length > 0) {
        console.log(`📋 Encontrados ${disabledTickets.length} tickets deshabilitados en BD`);

        for (const ticket of disabledTickets) {
          this.disabledTickets.set(ticket.issueKey, ticket);
          console.log(`🚫 Ticket deshabilitado: ${ticket.issueKey} - ${ticket.reason}`);
        }
      } else {
        console.log('✅ No hay tickets deshabilitados en BD');
      }
    } catch (error) {
      console.error('❌ Error cargando tickets deshabilitados desde BD:', error);
    }
  }

  // Desactivar asistente para un ticket específico
  async disableAssistantForTicket(issueKey: string, reason: string = 'No reason provided'): Promise<void> {
    const disabledTicket: DisabledTicket = {
      issueKey,
      reason,
      disabledAt: new Date(),
      disabledBy: 'CEO Dashboard'
    };

    this.disabledTickets.set(issueKey, disabledTicket);

    // Persistir en base de datos
    try {
      await this.dbService.createOrUpdateDisabledTicket(disabledTicket);
      console.log(`🚫 AI Assistant disabled for ticket: ${issueKey} - Reason: ${reason} - Saved to DB`);
    } catch (error) {
      console.error('❌ Error saving disabled ticket to DB:', error);
    }
  }

  // Reactivar asistente para un ticket específico
  async enableAssistantForTicket(issueKey: string): Promise<void> {
    const removed = this.disabledTickets.delete(issueKey);
    if (removed) {
      // Remover de base de datos
      try {
        await this.dbService.removeDisabledTicket(issueKey);
        console.log(`✅ AI Assistant re-enabled for ticket: ${issueKey} - Removed from DB`);
      } catch (error) {
        console.error('❌ Error removing disabled ticket from DB:', error);
      }
    }
  }

  // Verificar si un ticket tiene el asistente desactivado
  isTicketDisabled(issueKey: string): boolean {
    return this.disabledTickets.has(issueKey);
  }

  // Obtener información de un ticket desactivado
  getDisabledTicketInfo(issueKey: string): DisabledTicket | null {
    return this.disabledTickets.get(issueKey) || null;
  }

  // Obtener lista de todos los tickets desactivados
  getDisabledTickets(): DisabledTicket[] {
    return Array.from(this.disabledTickets.values());
  }

  // Obtener estadísticas de tickets desactivados
  getDisabledTicketsStats(): { total: number; recent: number } {
    const total = this.disabledTickets.size;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = Array.from(this.disabledTickets.values())
      .filter(ticket => ticket.disabledAt > oneDayAgo).length;

    return { total, recent };
  }
}
