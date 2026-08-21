export interface ServiceExistenceCheckerPort {
  exists(userId: number, serviceId: string): Promise<boolean>;
}
