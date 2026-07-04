'use strict'

import { Router } from 'express';
import {
    getReservations, getReservationById, createReservation, updateReservation, changeReservationStatus,
    sugerirMesas, getReservationsByUser, obtenerMesasOcupadas
} from './reservaciones.controller.js';
import { validateCreateReservation, validateUpdateReservation, validateReservationStatusChange, validateGetReservationById } from '../../middlewares/reservation-validation.js';

const router = Router();

// ⚠️ Las rutas específicas SIEMPRE antes que las de parámetro genérico (/:id)
// Si /usuario/:uid va después de /:id, Express captura "usuario" como id y nunca llega aquí.
router.get('/sugerir-mesas', sugerirMesas);
router.get('/usuario/:uid', getReservationsByUser);
router.get('/obtener-ocupadas', obtenerMesasOcupadas);

// Rutas generales con :id (deben ir DESPUÉS de las rutas específicas)
router.get('/', getReservations);
router.get('/:id', validateGetReservationById, getReservationById);
router.post('/', validateCreateReservation, createReservation);
router.put('/:id', validateUpdateReservation, updateReservation);

router.put('/:id/cancelar',
    (req, res, next) => {
        req.body = req.body || {};
        req.body.estado = 'cancelada';
        next();
    },
    validateReservationStatusChange,
    changeReservationStatus
);

export default router;
