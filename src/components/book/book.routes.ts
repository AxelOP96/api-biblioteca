import { Router } from 'express';
import { authenticate, authorizeRoles } from '../../middlewares/auth.middleware';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from './book.controller';
 
const router = Router();
 
// Rutas públicas (lectura)
router.get('/', getBooks);
router.get('/:id', getBookById);
 
// Rutas protegidas con JWT (crear, modificar, eliminar)
router.post('/', authenticate, createBook);
router.put('/:id', authenticate, updateBook);
// Extra (roles): solo un admin puede eliminar
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteBook);
 
export default router;
 