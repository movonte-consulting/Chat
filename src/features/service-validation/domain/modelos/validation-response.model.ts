export interface ServiceValidationResponse {
  id: number;
  serviceName: string;
  serviceDescription?: string;
  websiteUrl: string;
  requestedDomain: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  validatedBy?: number;
  validatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}
