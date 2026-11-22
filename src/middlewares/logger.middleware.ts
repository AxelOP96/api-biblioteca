import { Request, Response, NextFunction } from 'express';
 
// Extra: muestra en consola el método y la URL de cada petición.
export const logger = (req: Request, _res: Response, next: NextFunction): void => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
};