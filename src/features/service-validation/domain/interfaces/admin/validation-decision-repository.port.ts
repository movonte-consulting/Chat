import { ValidationDecisionRow } from '../../modelos/service-configuration-row.model';

export interface ValidationDecisionRepositoryPort {
  findServiceForDecision(id: number): Promise<ValidationDecisionRow | null>;
  approve(id: number, configuration: any): Promise<void>;
  reject(id: number, configuration: any): Promise<void>;
}
