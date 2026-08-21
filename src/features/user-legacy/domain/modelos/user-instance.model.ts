export interface UserInstance {
  id: number;
  instanceName: string;
  instanceDescription?: string;
  isActive: boolean;
  settings?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInstanceInput {
  instanceName: string;
  instanceDescription?: string;
  isActive: boolean;
  settings?: any;
}

export interface UpdateInstanceInput {
  instanceName?: string;
  instanceDescription?: string;
  isActive?: boolean;
  settings?: any;
}
