export interface OrganizationUser {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface Organization {
  name: string;
  logo: string | null;
  users: OrganizationUser[];
}

/** Fila cruda de usuario tal como la devuelve el repositorio, antes de agrupar por organización. */
export interface RawOrgUser {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  jiraUrl: string | null;
}
