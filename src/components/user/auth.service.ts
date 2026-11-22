import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { userRepository } from './user.repository';
 
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10;
 
interface RegisterData {
  name?: unknown;
  email?: unknown;
  password?: unknown;
}
 
interface LoginData {
  email?: unknown;
  password?: unknown;
}
 
export const authService = {
  async register(data: RegisterData) {
    const { name, email, password } = data;
 
    if (typeof name !== 'string' || name.trim() === '') {
      throw new AppError('El nombre es obligatorio', 400);
    }
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
      throw new AppError('El email no es válido', 400);
    }
    if (typeof password !== 'string' || password.length < 6) {
      throw new AppError('La contraseña debe tener al menos 6 caracteres', 400);
    }
 
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new AppError('Ya existe un usuario con ese email', 400);
    }
 
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
    });
 
    return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
  },
 
  async login(data: LoginData) {
    const { email, password } = data;
 
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      throw new AppError('Email y contraseña son obligatorios', 400);
    }
 
    const user = await userRepository.findByEmail(email.toLowerCase().trim(), true);
    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }
 
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new AppError('Credenciales inválidas', 401);
    }
 
    // El token solo lleva el id y el rol: nunca la contraseña ni otros datos sensibles.
    const token = jwt.sign({ id: user._id.toString(), role: user.role }, env.JWT_SECRET, {
      expiresIn: '1h',
    });
 
    return {
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    };
  },
};
 
 