export interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  endpoints: {
    contact: string;
    chatbot: string;
    health: string;
  };
}

export interface DetailedHealthStatus {
  status: string;
  timestamp: string;
  services: {
    openai: { configured: boolean; assistantId: boolean };
    jira: { configured: boolean; baseUrl: string };
    email: { configured: boolean; host: string };
  };
  environment: string;
}
