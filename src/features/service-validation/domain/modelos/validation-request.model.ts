export interface ServiceValidationRequest {
  serviceName: string;
  serviceDescription?: string;
  websiteUrl: string;
  requestedDomain: string;
  adminId?: number;
}
