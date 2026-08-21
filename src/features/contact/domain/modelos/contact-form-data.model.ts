export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
  source?: string;
}

export interface JiraIssueSummary {
  id: string;
  key: string;
  url: string;
}
