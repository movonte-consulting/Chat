// Generar token protegido para el servicio (no expone el token real)
export function generateProtectedToken(serviceId: string, userId: number, expirationHours: number = 24): string {
  const jwt = require('jsonwebtoken');

  // Crear payload del token
  const payload = {
    serviceId,
    userId,
    type: 'protected',
    timestamp: Date.now()
  };

  // Generar token JWT con tiempo de expiración personalizable
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback-secret',
    {
      expiresIn: `${expirationHours}h`,
      issuer: 'movonte-chatbot',
      audience: 'protected-service'
    }
  );

  return token;
}

// Validar token protegido
export function validateProtectedToken(protectedToken: string): { userId: number; serviceId: string; isValid: boolean } {
  try {
    const jwt = require('jsonwebtoken');

    // Verificar si es un token JWT
    if (protectedToken.startsWith('eyJ')) {
      const decoded = jwt.verify(protectedToken, process.env.JWT_SECRET || 'fallback-secret');

      if (decoded.type === 'protected' && decoded.serviceId && decoded.userId) {
        return {
          userId: decoded.userId,
          serviceId: decoded.serviceId,
          isValid: true
        };
      }
    }

    // Fallback para tokens antiguos (formato svc_)
    const parts = protectedToken.split('_');
    if (parts.length === 5 && parts[0] === 'svc') {
      const userId = parseInt(parts[1]);
      const serviceId = parts[2];
      return { userId, serviceId, isValid: true };
    }

    return { userId: 0, serviceId: '', isValid: false };
  } catch (error) {
    console.error('Error validating protected token:', error);
    return { userId: 0, serviceId: '', isValid: false };
  }
}
