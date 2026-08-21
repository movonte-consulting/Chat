import { UserServiceInfo } from '../modelos/user-service-info.model';

export interface UserServiceResolverPort {
  /**
   * Busca el servicio de usuario cuyo projectKey coincide con el del ticket.
   * requireApproved=true replica el filtro de comment_created (approval_status = 'approved' OR NULL);
   * los flujos de issue_created/status_change no filtran por approval_status (comportamiento existente, no se corrige).
   */
  findByProjectKey(projectKey: string, options?: { requireApproved?: boolean }): Promise<UserServiceInfo | null>;
}
