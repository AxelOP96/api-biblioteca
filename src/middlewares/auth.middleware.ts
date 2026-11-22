import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { handleError } from '../utils/handleError';
 
export type UserRole = 'user' | 'admin';
 
export interface AuthPayload {
  id: string;
  role: UserRole;
}
 
export interface AuthRequest extends Request {
  user?: AuthPayload;
}
 
// Verifica el JWT enviado en el header "Authorization: Bearer <token>".
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const header = req.headers.authorization;
 
    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Token no proporcionado' });
      return;
    }
 
    const token = header.split(' ')[1];
 
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
      req.user = { id: decoded.id, role: decoded.role };
      next();
    } catch {
      res.status(401).json({ message: 'Token inválido o expirado' });
    }
  } catch (error) {
    handleError(res, error);
  }
};
 
// Extra (roles): permite el acceso solo a los roles indicados.
export const authorizeRoles =
  (...roles: UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user || !roles.includes(req.user.role)) {
        res.status(403).json({ message: 'No tenés permisos para realizar esta acción' });
        return;
      }
      next();
    } catch (error) {
      handleError(res, error);
    }
  };
 