import { Schema, model, Document } from 'mongoose';
import { UserRole } from '../../middlewares/auth.middleware';
 
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
 
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);
 
export const User = model<IUser>('User', userSchema);