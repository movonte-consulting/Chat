/**
 * Sequelize implementation of ConversationRepositoryPort.
 * Table: whatsapp_conversations
 * States:
 *   pre_selection – customer has not yet selected a service; generic agent responds.
 *   active        – service selected, Jira ticket created, service agent handles messages.
 */

import { sequelize } from '../../../../config/database';
import { Conversation } from '../../domain/modelos/conversation.model';
import { ConversationRepositoryPort } from '../../domain/interfaces/conversation-repository.port';

export class ConversationRepository implements ConversationRepositoryPort {
  normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return digits ? `+${digits}` : phone;
  }

  async getConversation(phone: string): Promise<Conversation | null> {
    const normalized = this.normalizePhone(phone);
    const [rows] = await sequelize.query(
      `SELECT * FROM whatsapp_conversations WHERE phone_number = :phone LIMIT 1`,
      { replacements: { phone: normalized } }
    ) as [any[], unknown];
    return rows?.[0] ?? null;
  }

  async getOrCreateConversation(
    phone: string,
    phoneNumberId: string,
    userId: number
  ): Promise<Conversation> {
    const normalized = this.normalizePhone(phone);

    await sequelize.query(
      `INSERT INTO whatsapp_conversations (phone_number, phone_number_id, state, user_id)
       VALUES (:phone, :phoneNumberId, 'pre_selection', :userId)
       ON DUPLICATE KEY UPDATE
         phone_number_id = COALESCE(:phoneNumberId, phone_number_id),
         updated_at = CURRENT_TIMESTAMP`,
      { replacements: { phone: normalized, phoneNumberId: phoneNumberId || null, userId } }
    );

    const conv = await this.getConversation(normalized);
    return conv!;
  }

  async activateConversation(phone: string, issueKey: string, serviceId: string): Promise<void> {
    const normalized = this.normalizePhone(phone);
    await sequelize.query(
      `UPDATE whatsapp_conversations
       SET state = 'active', issue_key = :issueKey, service_id = :serviceId,
           updated_at = CURRENT_TIMESTAMP
       WHERE phone_number = :phone`,
      { replacements: { phone: normalized, issueKey, serviceId } }
    );
  }

  async updateThreadId(phone: string, threadId: string): Promise<void> {
    const normalized = this.normalizePhone(phone);
    await sequelize.query(
      `UPDATE whatsapp_conversations
       SET openai_thread_id = :threadId, updated_at = CURRENT_TIMESTAMP
       WHERE phone_number = :phone`,
      { replacements: { phone: normalized, threadId } }
    );
  }

  async findByIssueKey(issueKey: string): Promise<Conversation | null> {
    const [rows] = await sequelize.query(
      `SELECT * FROM whatsapp_conversations
       WHERE issue_key = :issueKey AND state = 'active' LIMIT 1`,
      { replacements: { issueKey } }
    ) as [any[], unknown];
    return rows?.[0] ?? null;
  }

  async isMessageProcessed(phone: string, msgId: string): Promise<boolean> {
    const conv = await this.getConversation(phone);
    if (!conv?.processed_msg_ids) return false;
    try {
      const ids: string[] = JSON.parse(conv.processed_msg_ids);
      return ids.includes(msgId);
    } catch {
      return false;
    }
  }

  async markMessageProcessed(phone: string, msgId: string): Promise<void> {
    const normalized = this.normalizePhone(phone);
    const conv = await this.getConversation(normalized);
    let ids: string[] = [];
    if (conv?.processed_msg_ids) {
      try {
        ids = JSON.parse(conv.processed_msg_ids);
      } catch {
        ids = [];
      }
    }
    if (!ids.includes(msgId)) {
      ids.push(msgId);
      if (ids.length > 20) ids = ids.slice(-20);
    }
    await sequelize.query(
      `UPDATE whatsapp_conversations
       SET processed_msg_ids = :ids, updated_at = CURRENT_TIMESTAMP
       WHERE phone_number = :phone`,
      { replacements: { phone: normalized, ids: JSON.stringify(ids) } }
    );
  }

  async resetConversation(phone: string): Promise<void> {
    const normalized = this.normalizePhone(phone);
    await sequelize.query(
      `UPDATE whatsapp_conversations
       SET state = 'pre_selection', issue_key = NULL, service_id = NULL,
           openai_thread_id = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE phone_number = :phone`,
      { replacements: { phone: normalized } }
    );
  }
}
