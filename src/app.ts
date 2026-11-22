import express, { Request, Response, NextFunction } from 'express';
import { logger } from './middlewares/logger.middleware';
import authRoutes from './components/user/auth.routes';
import bookRoutes from './components/book/book.routes';
 
const app = express();
 
app.use(express.json());
app.use(logger);
 
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
 
// Ruta inexistente -> 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});
 
// JSON mal formado -> 400; cualquier otro error inesperado -> 500
app.use((err: Error & { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === 'entity.parse.failed') {
    res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido' });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});
 
export default app;
 