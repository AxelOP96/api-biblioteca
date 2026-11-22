import { FilterQuery } from 'mongoose';
import { Book, IBook } from './book.model';
import { escapeRegex } from '../../utils/escapeRegex';
 
export interface BookData {
  title: string;
  author: string;
  year: number;
  genre: string;
  available?: boolean;
}
 
// Capa de acceso a datos de libros.
export const bookRepository = {
  findAll: (filter: FilterQuery<IBook> = {}) =>
    Book.find(filter).populate('createdBy', 'name').sort({ createdAt: -1 }),
 
  findByIdPopulated: (id: string) => Book.findById(id).populate('createdBy', 'name'),
 
  findById: (id: string) => Book.findById(id),
 
  findDuplicate: (title: string, author: string, excludeId?: string) => {
    const filter: FilterQuery<IBook> = {
      title: new RegExp(`^${escapeRegex(title)}$`, 'i'),
      author: new RegExp(`^${escapeRegex(author)}$`, 'i'),
    };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    return Book.findOne(filter);
  },
 
  create: (data: BookData & { createdBy: string }) => Book.create(data),
 
  update: (id: string, data: BookData) =>
    Book.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
 
  remove: (id: string) => Book.findByIdAndDelete(id),
};
 
 