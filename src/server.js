import http from 'http';
import app from './app.js';
import config from './config/config.js';
import { init } from './db/mongodb.js';
import { logger } from './config/logger.js';

await init();

const server = http.createServer(app);
const PORT = config.port;

server.listen(PORT, () =>{
    logger.info(`Server iniciado en http://localhost:${PORT}`);
})
