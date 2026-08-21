export interface UserLookupResult {
  exists: boolean;
  adminId: number | undefined;
}

export interface UserLookupPort {
  findAdminIdForUser(userId: number): Promise<UserLookupResult>;
}
