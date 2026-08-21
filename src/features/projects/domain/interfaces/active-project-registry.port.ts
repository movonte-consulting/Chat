/** Proyecto activo GLOBAL (JiraService.getInstance()), no scoped por usuario. */
export interface ActiveProjectRegistryPort {
  get(): string;
  set(projectKey: string): void;
}
