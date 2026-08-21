import { CompleteInitialSetupInput, InitialSetupStatus } from '../modelos/initial-setup.model';

export interface InitialSetupRepositoryPort {
  complete(userId: number, input: CompleteInitialSetupInput): Promise<void>;
  getStatus(userId: number): Promise<InitialSetupStatus | null>;
}
