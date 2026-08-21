import jwt from 'jsonwebtoken';
import { TokenIssuerPort } from '../../domain/interfaces/token-issuer.port';

export class JwtTokenIssuerAdapter implements TokenIssuerPort {
  issue(userId: number): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' });
  }
}
