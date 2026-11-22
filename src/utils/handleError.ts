import { Response } from 'express';
import mongoose from 'mongoose';
import { AppError } from './AppError';
 
// Traduce cualquier error a una respuesta HTTP con el código de estado correcto.
export const handleError = (res: Response, error: unknown): Response => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
 
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: error.message });
  }
 
  console.error(error);
  return res.status(500).json({ message: 'Error interno del servidor' });
};