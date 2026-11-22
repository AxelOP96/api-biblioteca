import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { handleError } from '../../utils/handleError';
import { bookService } from './book.service';
 
export const getBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await bookService.getAll(req.query);
    res.status(200).json(books);
  } catch (error) {
    handleError(res, error);
  }
};
 
export const getBookById = async (req: Request, res: Response): Promise<void> => {
  try {
    const book = await bookService.getById(req.params.id);
    res.status(200).json(book);
  } catch (error) {
    handleError(res, error);
  }
};
 
export const createBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const book = await bookService.create(req.body ?? {}, req.user!);
    res.status(201).json(book);
  } catch (error) {
    handleError(res, error);
  }
};
 
export const updateBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const book = await bookService.update(req.params.id, req.body ?? {}, req.user!);
    res.status(200).json(book);
  } catch (error) {
    handleError(res, error);
  }
};
 
export const deleteBook = async (req: Request, res: Response): Promise<void> => {
  try {
    await bookService.remove(req.params.id);
    res.status(200).json({ message: 'Libro eliminado correctamente' });
  } catch (error) {
    handleError(res, error);
  }
};
 
 