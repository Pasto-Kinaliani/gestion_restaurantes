'use strict';

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { corsOptions } from './cors-configuration.js';
import { dbConnection } from './db.js';
import usuarioRoutes from '../src/Usuarios/usuarios.routes.js';
import pedidoRoutes from '../src/Pedidos/pedidos.routes.js';
import sucursalRoutes from '../src/Sucursal/sucursal.routes.js';
import reservacionRoutes from '../src/Reservaciones/reservaciones.routes.js';
import ventasRoutes from '../src/Ventas/ventas.routes.js';
import platillosRoutes from '../src/Platillos/platillos.routes.js';
import mesasRoutes from '../src/Mesas/mesas.routes.js';
import eventosRoutes from '../src/Eventos/eventos.routes.js';
const BASE_URL = '/gestionRestaurantes/v1/usuario';

const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(morgan('dev'));
}

const routes = (app) => {
    // Rutas de la aplicacion
    app.use(`${BASE_URL}/usuarios`, usuarioRoutes);
    app.use(`${BASE_URL}/pedidos`, pedidoRoutes);
    app.use(`${BASE_URL}/reservaciones`, reservacionRoutes);
    app.use(`${BASE_URL}/platillos`, platillosRoutes);
    app.use(`${BASE_URL}/ventas`, ventasRoutes);
    app.use(`${BASE_URL}/sucursales`, sucursalRoutes);
    app.use(`${BASE_URL}/mesas`, mesasRoutes);
    app.use(`${BASE_URL}/eventos`, eventosRoutes);
}

const initServer = async (app) => {
    app = express();
    const PORT = process.env.PORT || 3001;

    try {
        dbConnection();
        middlewares(app);
        routes(app);

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en el puerto ${PORT}`);
            console.log(`Base URL: http://localhost:${PORT}${BASE_URL}`)
        });

        app.get(`${BASE_URL}/health`, (req, res) => {
            res.status(200).json(
                {
                    status: 'ok',
                    service: 'Gestion de restaurantes User',
                    version: '1.0.0'
                }
            );
        });

    } catch (error) {
        console.log(error);
    }
}

export { initServer };