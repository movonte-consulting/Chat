export interface FormattedComment {
  id: string;
  body: string;
  author: {
    displayName: string;
    emailAddress: string;
  };
  created: string;
  isFromAI: boolean;
  isFromAgent: boolean;
  source: 'assistant' | 'agent' | 'user';
}
