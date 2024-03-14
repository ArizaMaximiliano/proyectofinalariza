import express from "express";
import session from 'express-session';
import handlebars from "express-handlebars";
import MongoStore from 'connect-mongo';
import path from 'path';
import passport from 'passport';

import { __dirname } from './utils.js';
import { URI } from './db/mongodb.js';
import { initializePassport } from './config/passportConfig.js';
import config from './config/config.js';
import { addLogger } from './config/logger.js';

import indexRouter from './routers/views/indexRouter.js';
import productRouter from './routers/api/productRouter.js';
import cartRouter from './routers/api/cartRouter.js';
import sessionRouter from './routers/api/sessionRouter.js';
import usersRouter from './routers/api/usersRouter.js'

const app = express();

app.use(session({
  secret: config.secret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: URI,
    mongoOptions: {},
    ttl: 120,
  }), 
}));

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

app.use(addLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, '../public')));

//Configuracion del motor handlebars
app.engine('handlebars', handlebars.engine())
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'handlebars');

//Ruta para las vistas
app.use('/', indexRouter);
//Rutas para las API
app.use('/api', productRouter);
app.use('/api', cartRouter);
app.use('/api', sessionRouter);
app.use('/api', usersRouter);

//Manejo de errores
app.use((error, req, res, next) => {
    const message = `Ocurrió un error inesperado: ${error.message}`;
    req.logger.error(message);
    res.status(500).json({ message });
})

export default app;
