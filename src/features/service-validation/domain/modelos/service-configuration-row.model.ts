export interface ServiceConfigurationRow {
  id: number;
  serviceId: string;
  serviceName: string;
  userId: number;
  assistantId: string;
  assistantName: string;
  isActive: boolean;
  approvalStatus: string;
  configuration: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface PendingValidationRow {
  id: number;
  serviceId: string;
  serviceName: string;
  userId: number;
  assistantId: string;
  assistantName: string;
  isActive: boolean;
  approvalStatus: string;
  configuration: any;
  createdAt: Date;
  updatedAt: Date;
  username: string;
  email: string;
  adminId: number;
}

export interface ValidationDecisionRow {
  id: number;
  service_id: string;
  service_name: string;
  user_id: number;
  approval_status: string;
  configuration: any;
  userAdminId: number;
}
