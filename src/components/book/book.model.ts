import { Schema, model, Document, Types } from 'mongoose';
 
export interface IBook extends Document {
  title: string;
  author: string;
  year: number;
  genre: string;
  available: boolean;
  createdBy: Types.ObjectId;
}
 
const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true, trim: true },
    available: { type: Boolean, default: true },
    // Extra (relación entre modelos): cada libro pertenece al usuario que lo creó.
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);
 
export const Book = model<IBook>('Book', bookSchema);
 