import { UserInstancesRepositoryPort } from '../domain/interfaces/user-instances-repository.port';
import { UserInstance } from '../domain/modelos/user-instance.model';

export type CreateInstanceResult =
  | { kind: 'validation_error'; message: string }
  | { kind: 'ok'; data: UserInstance };

export class CreateInstanceUseCase {
  constructor(private readonly userInstances: UserInstancesRepositoryPort) {}

  async execute(userId: number, instanceName: string | undefined, instanceDescription: string | undefined, settings: any): Promise<CreateInstanceResult> {
    if (!instanceName) {
      return { kind: 'validation_error', message: 'Nombre de instancia es requerido' };
    }

    const data = await this.userInstances.create(userId, {
      instanceName,
      instanceDescription,
      isActive: true,
      settings
    });

    return { kind: 'ok', data };
  }
}
