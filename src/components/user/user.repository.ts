import { User, IUser } from './user.model';
 
// Capa de acceso a datos de usuarios.
export const userRepository = {
  findByEmail: (email: string, withPassword = false) => {
    const query = User.findOne({ email });
    return withPassword ? query.select('+password') : query;
  },
 
  create: (data: { name: string; email: string; password: string }): Promise<IUser> =>
    User.create(data),
};