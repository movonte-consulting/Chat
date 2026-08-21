import { RequesterJiraCredentials } from '../../modelos/disabled-ticket.model';

/**
 * A diferencia del admin (que confía en req.user del JWT), el controller de usuario original
 * siempre re-consulta el usuario por id en cada request — se preserva ese comportamiento.
 */
export interface AuthenticatedUserLookupPort {
  findById(userId: number): Promise<RequesterJiraCredentials | null>;
}
