'use strict'

import { Router } from 'express';
import { getReservations, getReservationById, createReservation, updateReservation, changeReservationStatus, sugerirMesas } from './reservaciones.controller.js';
import { validateCreateReservation, validateUpdateReservation, validateReservationStatusChange, validateGetReservationById } from '../../middlewares/reservation-validation.js';

const router = Router();

router.get('/', getReservations);
router.get('/sugerir-mesas', sugerirMesas);
router.get('/:id', validateGetReservationById, getReservationById);
router.post('/', validateCreateReservation, createReservation);
router.put('/:id', validateUpdateReservation, updateReservation);
router.put('/:id/confirmar',
    (req, res, next) => {
        req.body = req.body || {};
        req.body.estado = 'confirmada';
        next();
    },
    validateReservationStatusChange,
    changeReservationStatus
);


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
