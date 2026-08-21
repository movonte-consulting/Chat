import { UserInstance, CreateInstanceInput, UpdateInstanceInput } from '../modelos/user-instance.model';

export interface UserInstancesRepositoryPort {
  list(userId: number): Promise<UserInstance[]>;
  create(userId: number, input: CreateInstanceInput): Promise<UserInstance>;
  update(userId: number, id: number, input: UpdateInstanceInput): Promise<void>;
  delete(userId: number, id: number): Promise<void>;
}
