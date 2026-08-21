export interface GlobalJiraStatusesPort {
  getAllPossibleStatuses(): Promise<any[]>;
}
