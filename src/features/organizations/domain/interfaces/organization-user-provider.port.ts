import { RawOrgUser } from '../modelos/organization.model';

export interface OrganizationUserProviderPort {
  listAll(): Promise<RawOrgUser[]>;
}
