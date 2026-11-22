import { env } from './config/env';
import { connectDB } from './config/db';
import app from './app';
 
const start = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(env.PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
};

start();