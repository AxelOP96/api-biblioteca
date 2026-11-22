import mongoose, { FilterQuery } from 'mongoose';
import { AppError } from '../../utils/AppError';
import { escapeRegex } from '../../utils/escapeRegex';
import { AuthPayload } from '../../middlewares/auth.middleware';
import { IBook } from './book.model';
import { bookRepository, BookData } from './book.repository';
 
interface BookFilters {
  genre?: unknown;
  author?: unknown;
  available?: unknown;
}
 
const assertValidId = (id: string): void => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('El id proporcionado no es válido', 400);
  }
};
 
// Validaciones de negocio sobre los datos de un libro.
const validateBookData = (body: Record<string, unknown>): BookData => {
  const { title, author, year, genre, available } = body;
 
  // Validación 1: título, autor y género son obligatorios y no pueden estar vacíos.
  if (typeof title !== 'string' || title.trim() === '') {
    throw new AppError('El título es obligatorio', 400);
  }
  if (typeof author !== 'string' || author.trim() === '') {
    throw new AppError('El autor es obligatorio', 400);
  }
  if (typeof genre !== 'string' || genre.trim() === '') {
    throw new AppError('El género es obligatorio', 400);
  }
 
  // Validación 2: el año debe ser un entero positivo que no sea futuro.
  const currentYear = new Date().getFullYear();
  if (typeof year !== 'number' || !Number.isInteger(year) || year < 1 || year > currentYear) {
    throw new AppError(`El año debe ser un número entero entre 1 y ${currentYear}`, 400);
  }
 
  // Validación 3: "available" debe ser booleano si se envía.
  if (available !== undefined && typeof available !== 'boolean') {
    throw new AppError('El campo "available" debe ser verdadero o falso', 400);
  }
 
  return {
    title: title.trim(),
    author: author.trim(),
    year,
    genre: genre.trim(),
    available: available as boolean | undefined,
  };
};
 
export const bookService = {
  async getAll(filters: BookFilters) {
    const query: FilterQuery<IBook> = {};
 
    // Extra (filtros con req.query)
    if (typeof filters.genre === 'string' && filters.genre.trim() !== '') {
      query.genre = new RegExp(`^${escapeRegex(filters.genre.trim())}$`, 'i');
    }
    if (typeof filters.author === 'string' && filters.author.trim() !== '') {
      query.author = new RegExp(escapeRegex(filters.author.trim()), 'i');
    }
    if (filters.available !== undefined) {
      if (filters.available !== 'true' && filters.available !== 'false') {
        throw new AppError('El filtro "available" debe ser true o false', 400);
      }
      query.available = filters.available === 'true';
    }
 
    return bookRepository.findAll(query);
  },
 
  async getById(id: string) {
    assertValidId(id);
    const book = await bookRepository.findByIdPopulated(id);
    if (!book) {
      throw new AppError('Libro no encontrado', 404);
    }
    return book;
  },
 
  async create(body: Record<string, unknown>, user: AuthPayload) {
    const data = validateBookData(body);
 
    // Validación 4: no puede haber dos libros con el mismo título y autor.
    const duplicate = await bookRepository.findDuplicate(data.title, data.author);
    if (duplicate) {
      throw new AppError('Ya existe un libro con ese título y autor', 400);
    }
 
    return bookRepository.create({ ...data, createdBy: user.id });
  },
 
  async update(id: string, body: Record<string, unknown>, user: AuthPayload) {
    assertValidId(id);
 
    const existing = await bookRepository.findById(id);
    if (!existing) {
      throw new AppError('Libro no encontrado', 404);
    }
 
    // Extra (relación): solo el usuario que creó el libro (o un admin) puede modificarlo.
    if (existing.createdBy.toString() !== user.id && user.role !== 'admin') {
      throw new AppError('Solo el creador del libro o un admin puede modificarlo', 403);
    }
 
    const data = validateBookData(body);
 
    const duplicate = await bookRepository.findDuplicate(data.title, data.author, id);
    if (duplicate) {
      throw new AppError('Ya existe un libro con ese título y autor', 400);
    }
 
    const updated = await bookRepository.update(id, data);
    if (!updated) {
      throw new AppError('Libro no encontrado', 404);
    }
    return updated;
  },
 
  async remove(id: string) {
    assertValidId(id);
    const deleted = await bookRepository.remove(id);
    if (!deleted) {
      throw new AppError('Libro no encontrado', 404);
    }
  },
};
 