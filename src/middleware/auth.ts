import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserPermissions } from '../models';

// Extender la interfaz Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        role: 'admin' | 'user';
        permissions?: UserPermissions;
      jiraToken?: string;
      jiraUrl?: string;
      openaiToken?: string;
      isInitialSetupComplete?: boolean;
      organizationLogo?: string;
      };
    }
  }
}

// Middleware de autenticación
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        success: false, 
        error: 'Token de acceso requerido' 
      });
      return;
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Buscar el usuario en la base de datos
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.isActive) {
      res.status(401).json({ 
        success: false, 
        error: 'Usuario no válido o inactivo' 
      });
      return;
    }

    // Agregar información del usuario a la request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      jiraToken: user.jiraToken,
      jiraUrl: user.jiraUrl,
      openaiToken: user.openaiToken,
      isInitialSetupComplete: user.isInitialSetupComplete,
      organizationLogo: (user as any).organizationLogo
    };

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(401).json({ 
      success: false, 
      error: 'Token inválido' 
    });
  }
};

// Middleware para redirigir al login si no está autenticado (para páginas HTML)
export const redirectToLoginIfNotAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('🔍 Verificando autenticación para:', req.path);
    
    // Verificar si hay token en cookies
    const cookieToken = req.cookies?.authToken;
    console.log('🍪 Cookie token:', cookieToken ? 'ENCONTRADO' : 'NO ENCONTRADO');
    
    // También verificar headers (para compatibilidad con JavaScript)
    const authHeader = req.headers['authorization'];
    const headerToken = authHeader && authHeader.split(' ')[1];
    console.log('📋 Header token:', headerToken ? 'ENCONTRADO' : 'NO ENCONTRADO');
    
    const finalToken = cookieToken || headerToken;
    
    if (!finalToken) {
      console.log('❌ No hay token, redirigiendo al login');
      return res.redirect('/login');
    }

    // Verificar el token
    const decoded = jwt.verify(finalToken, process.env.JWT_SECRET || 'fallback-secret') as any;
    console.log('✅ Token válido para usuario:', decoded.userId);
    
    // Buscar el usuario en la base de datos
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.isActive) {
      console.log('❌ Usuario inválido o inactivo, redirigiendo al login');
      return res.redirect('/login');
    }

    console.log('✅ Usuario autenticado:', user.username, 'rol:', user.role);

    // Agregar información del usuario a la request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      jiraToken: user.jiraToken,
      jiraUrl: user.jiraUrl,
      openaiToken: user.openaiToken,
      isInitialSetupComplete: user.isInitialSetupComplete
    };

    next();
  } catch (error) {
    console.error('❌ Error en autenticación:', error);
    // Token inválido, redirigir al login
    return res.redirect('/login');
  }
};

// Middleware para autenticar tokens protegidos de widgets
export const authenticateProtectedToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        success: false, 
        error: 'Token de acceso requerido' 
      });
      return;
    }

    // Validar el token protegido
    const { validateProtectedToken } = await import('../services/protected_token_service');
    const validation = validateProtectedToken(token);
    
    if (!validation.isValid) {
      res.status(401).json({ 
        success: false, 
        error: 'Token protegido inválido o expirado' 
      });
      return;
    }

    // Buscar el usuario en la base de datos
    const user = await User.findByPk(validation.userId);
    
    if (!user || !user.isActive) {
      res.status(401).json({ 
        success: false, 
        error: 'Usuario no válido o inactivo' 
      });
      return;
    }

    // Agregar información del usuario y servicio a la request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      jiraToken: user.jiraToken,
      jiraUrl: user.jiraUrl,
      openaiToken: user.openaiToken,
      isInitialSetupComplete: user.isInitialSetupComplete,
      organizationLogo: (user as any).organizationLogo
    };

    // Agregar serviceId al request para uso en controladores
    (req as any).serviceId = validation.serviceId;

    console.log(`✅ Token protegido válido para usuario ${user.id}, servicio: ${validation.serviceId}`);
    next();
  } catch (error) {
    console.error('Error en autenticación de token protegido:', error);
    res.status(401).json({ 
      success: false, 
      error: 'Token protegido inválido' 
    });
  }
};

// Middleware para verificar rol de administrador
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      error: 'Autenticación requerida' 
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ 
      success: false, 
      error: 'Acceso denegado. Se requieren permisos de administrador' 
    });
    return;
  }

  next();
};

// Middleware para verificar permisos específicos
export const requirePermission = (permission: keyof UserPermissions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: 'Autenticación requerida' 
      });
      return;
    }

    // Los admins tienen todos los permisos
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Verificar si el usuario tiene el permiso específico
    if (!req.user.permissions || !req.user.permissions[permission]) {
      res.status(403).json({ 
        success: false, 
        error: `Acceso denegado. Se requiere el permiso: ${permission}` 
      });
      return;
    }

    next();
  };
};

// Middleware para verificar si el usuario está autenticado (sin requerir token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      const user = await User.findByPk(decoded.userId);
      
      if (user && user.isActive) {
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        };
      }
    }
  } catch (error) {
    // Si hay error, simplemente continuar sin usuario autenticado
    console.log('Token opcional inválido:', error);
  }

  next();
};
