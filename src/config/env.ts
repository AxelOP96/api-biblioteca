import dotenv from 'dotenv';
 
dotenv.config();
 
const getRequired = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }
  return value;
};
 
export const env = {
  PORT: Number(process.env.PORT) || 3000,
  MONGO_URI: getRequired('MONGO_URI'),
  JWT_SECRET: getRequired('JWT_SECRET'),
};
 