export type ConversationState = 'pre_selection' | 'active';

export interface Conversation {
  id: number;
  phone_number: string;
  phone_number_id: string | null;
  state: ConversationState;
  openai_thread_id: string | null;
  issue_key: string | null;
  service_id: string | null;
  user_id: number;
  processed_msg_ids: string | null;
  created_at: Date;
  updated_at: Date;
}
