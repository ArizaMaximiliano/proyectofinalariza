import http from 'http';

import app from './app.js';
import { init } from './db/mongodb.js';

import { logger } from './config/logger.js';

await init();

const server = http.createServer(app);
const PORT = 8080;

server.listen(PORT, () =>{
    logger.info(`Server iniciado en http://localhost:${PORT}`);
})
