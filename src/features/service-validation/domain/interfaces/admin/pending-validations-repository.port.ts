import { PendingValidationRow } from '../../modelos/service-configuration-row.model';

export interface PendingValidationsRepositoryPort {
  listPendingForAdmin(adminId: number): Promise<PendingValidationRow[]>;
}
