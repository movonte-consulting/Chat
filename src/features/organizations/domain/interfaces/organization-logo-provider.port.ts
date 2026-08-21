export interface OrganizationLogoProviderPort {
  /** Mapa hostname -> logo, solo para usuarios que tengan organization_logo configurado. */
  getLogosByHost(): Promise<Record<string, string>>;
}
