import { UserDisabledTicket } from '../models';

interface DisabledTicket {
  issueKey: string;
  reason: string;
  disabledAt: string;
  disabledBy: string;
}

// Sin caché en memoria: cada llamada consulta la BD directamente (igual que el
// comportamiento original de UserConfigurationService para estos métodos).

export async function disableAssistantForTicket(userId: number, issueKey: string, reason: string): Promise<void> {
  try {
    await UserDisabledTicket.upsert({
      userId,
      issueKey,
      reason,
      disabledAt: new Date(),
      disabledBy: `user_${userId}`
    });
    console.log(`✅ Ticket ${issueKey} disabled for user ${userId}`);
  } catch (error) {
    console.error(`❌ Error disabling ticket ${issueKey} for user ${userId}:`, error);
    throw error;
  }
}

export async function enableAssistantForTicket(userId: number, issueKey: string): Promise<void> {
  try {
    await UserDisabledTicket.destroy({
      where: { userId, issueKey }
    });
    console.log(`✅ Ticket ${issueKey} enabled for user ${userId}`);
  } catch (error) {
    console.error(`❌ Error enabling ticket ${issueKey} for user ${userId}:`, error);
    throw error;
  }
}

export async function isTicketDisabled(userId: number, issueKey: string): Promise<boolean> {
  try {
    const ticket = await UserDisabledTicket.findOne({
      where: { userId, issueKey }
    });
    return !!ticket;
  } catch (error) {
    console.error(`❌ Error checking if ticket ${issueKey} is disabled for user ${userId}:`, error);
    return false;
  }
}

export async function getTicketInfo(userId: number, issueKey: string): Promise<DisabledTicket | null> {
  try {
    const ticket = await UserDisabledTicket.findOne({
      where: { userId, issueKey }
    });

    if (!ticket) return null;

    return {
      issueKey: ticket.issueKey,
      reason: ticket.reason || '',
      disabledAt: ticket.disabledAt?.toISOString() || new Date().toISOString(),
      disabledBy: ticket.disabledBy || `user_${userId}`
    };
  } catch (error) {
    console.error(`❌ Error getting ticket info for ${issueKey} and user ${userId}:`, error);
    return null;
  }
}

export async function getDisabledTickets(userId: number): Promise<DisabledTicket[]> {
  try {
    const tickets = await UserDisabledTicket.findAll({
      where: { userId },
      order: [['disabledAt', 'DESC']]
    });

    return tickets.map(ticket => ({
      issueKey: ticket.issueKey,
      reason: ticket.reason || '',
      disabledAt: ticket.disabledAt?.toISOString() || new Date().toISOString(),
      disabledBy: ticket.disabledBy || `user_${userId}`
    }));
  } catch (error) {
    console.error(`❌ Error getting disabled tickets for user ${userId}:`, error);
    return [];
  }
}
