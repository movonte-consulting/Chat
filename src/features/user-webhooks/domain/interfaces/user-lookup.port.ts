export interface UserLookupPort {
  exists(userId: number): Promise<boolean>;
}
