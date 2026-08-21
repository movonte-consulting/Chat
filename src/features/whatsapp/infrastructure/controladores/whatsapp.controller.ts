/**
 * WhatsApp Cloud API webhook controller. HTTP/Meta wire-format concern only —
 * all business logic lives in the application use cases.
 */

import { Request, Response } from 'express';
import { HandleTextMessageUseCase } from '../../application/handle-text-message.use-case';
import { HandleInteractiveReplyUseCase } from '../../application/handle-interactive-reply.use-case';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'chatbot_webhook_verify';

// ─────────────────────────────────────────────────────────────────────────────
// Meta webhook payload types
// ─────────────────────────────────────────────────────────────────────────────
interface WaMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
}

export class WhatsAppController {
  constructor(
    private readonly handleTextMessage: HandleTextMessageUseCase,
    private readonly handleInteractiveReply: HandleInteractiveReplyUseCase
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/whatsapp/webhook – Meta verification
  // ─────────────────────────────────────────────────────────────────────────
  async verifyWebhook(req: Request, res: Response): Promise<void> {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('[WhatsApp] Verification GET', { mode, tokenMatch: token === VERIFY_TOKEN });

    if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge != null) {
      console.log('✅ WhatsApp webhook verified');
      res.type('text/plain').status(200).send(String(challenge));
    } else {
      console.warn('⚠️ WhatsApp webhook verification failed');
      res.status(403).send('Forbidden');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/whatsapp/webhook – Incoming messages from Meta
  // ─────────────────────────────────────────────────────────────────────────
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as {
        object?: string;
        entry?: Array<{
          id: string;
          changes?: Array<{
            field?: string;
            value?: {
              metadata?: { phone_number_id?: string };
              contacts?: Array<{ wa_id: string; profile?: { name?: string } }>;
              messages?: WaMessage[];
            };
          }>;
        }>;
      };

      console.log('[WhatsApp] POST webhook', {
        object: body?.object,
        entryCount: body?.entry?.length ?? 0
      });

      if (body?.object !== 'whatsapp_business_account') {
        res.status(200).send('ok');
        return;
      }

      for (const entry of body.entry ?? []) {
        for (const change of entry.changes ?? []) {
          if (change.field !== 'messages' || !change.value?.messages) continue;

          const value = change.value;
          const phoneNumberId =
            value.metadata?.phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
          const contactMap = new Map(
            (value.contacts ?? []).map((c) => [c.wa_id, c.profile?.name || 'WhatsApp User'])
          );

          for (const msg of value.messages ?? []) {
            const phone = msg.from;
            const senderName = contactMap.get(phone) || `+${phone}`;

            // ── Text message ─────────────────────────────────────────────
            if (msg.type === 'text' && msg.text?.body) {
              await this.handleTextMessage.execute(
                phone, senderName, msg.text.body.trim(), phoneNumberId, msg.id
              );
              continue;
            }

            // ── Interactive reply (button or list tap) ───────────────────
            if (msg.type === 'interactive' && msg.interactive) {
              const reply =
                msg.interactive.button_reply ?? msg.interactive.list_reply ?? null;
              if (reply) {
                await this.handleInteractiveReply.execute(
                  phone, senderName, reply.id, reply.title, phoneNumberId, msg.id
                );
              }
            }
          }
        }
      }

      res.status(200).send('ok');
    } catch (error) {
      console.error('❌ WhatsApp webhook error:', error);
      res.status(200).send('ok');
    }
  }
}
