import mongoose from 'mongoose';
import config from '../config/config.js';
import { logger } from '../config/logger.js';

export const URI = config.db.mongodbUri;

export const init = async () => {
  try {
    await mongoose.connect(URI);
    logger.info('Conexión exitosa con la base de datos');
  } catch (error) {
    logger.error('Error al conectar con la base de datos:', error.message);
  }
}
