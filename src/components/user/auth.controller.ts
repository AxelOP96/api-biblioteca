import { Request, Response } from 'express';
import { authService } from './auth.service';
import { handleError } from '../../utils/handleError';
 
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await authService.register(req.body ?? {});
    res.status(201).json({ message: 'Usuario registrado correctamente', user });
  } catch (error) {
    handleError(res, error);
  }
};
 
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.login(req.body ?? {});
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};