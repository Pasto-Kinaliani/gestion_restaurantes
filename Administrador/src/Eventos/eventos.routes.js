import { Router } from 'express';
import {
    getEventos,
    getEventoById,
    createEvento,
    updateEvento,
    changeEventoStatus,
} from './eventos.controller.js';
import {
    validateCreateEvento,
    validateUpdateEventoRequest,
    validateEventoStatusChange,
    validateGetEventoById,
} from '../../middlewares/eventos-validators.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { uploadEventosImage } from '../../middlewares/file-uploader.js';

const router = Router();

// Rutas GET
router.get('/', getEventos);
router.get('/:id', validateGetEventoById, getEventoById);

// Rutas POST
router.post(
    '/',
    validateJWT,
    uploadEventosImage.single('image'),
    validateCreateEvento,
    createEvento
);

// Rutas PUT - actualizar evento
router.put(
    '/:id',
    validateJWT,
    uploadEventosImage.single('image'),
    validateUpdateEventoRequest,
    updateEvento
);

// Rutas PUT - cambiar estado
router.put('/:id/activar', validateEventoStatusChange, changeEventoStatus);
router.put('/:id/desactivar', validateEventoStatusChange, changeEventoStatus);

export default router;
