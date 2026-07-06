import { Router } from 'express';
import {
    getEventos,
    getEventoById
} from './eventos.controller.js';

const router = Router();

// Rutas GET publicas
router.get('/', getEventos);
router.get('/:id', getEventoById);

export default router;
