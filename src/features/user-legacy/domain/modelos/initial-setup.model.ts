export interface CompleteInitialSetupInput {
  jiraToken: string;
  jiraUrl: string;
  openaiToken: string;
  organizationLogo?: string;
}

export interface InitialSetupStatus {
  isInitialSetupComplete: boolean | null;
  jiraToken: string | null;
  openaiToken: string | null;
}
