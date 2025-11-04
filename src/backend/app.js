import express from 'express';
import config from './config.js';
import clientes from './modulos/clientes/rutas.js'
import morgan from 'morgan';
import error from '../red/errors.js';
const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Configuración del puerto
app.set('port', config.app.port);

//rutas

app.use('/api/clientes', clientes);

app.use(error)

export default app;