export interface JiraWebhookPayload {
  issue: {
    key: string;
    fields: {
      summary: string;
      status: {
        name: string;
      };
    };
  };
  comment: {
    body: string;
    author: {
      displayName: string;
      emailAddress: string;
    };
  };
  webhookEvent: string;
}
