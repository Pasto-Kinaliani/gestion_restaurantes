import { Router } from 'express';
import {
    getSucursales,
    getSucursalById,
    createSucursal,
    updateSucursal,
    changeSucursalStatus,
} from './sucursal.controller.js';
import {
    validateCreateSucursal,
    validateUpdateSucursalRequest,
    validateSucursalStatusChange,
    validateGetSucursalById,
} from '../../middlewares/sucursal-validators.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { uploadSucursalImage } from '../../middlewares/file-uploader.js';

const router = Router();

// Rutas GET
router.get('/', getSucursales);
router.get('/:id', validateGetSucursalById, getSucursalById);

// Rutas POST
router.post(
    '/',
    validateJWT,
    uploadSucursalImage.single('image'),
    validateCreateSucursal,
    createSucursal
);

// Rutas PUT - actualizar sucursal
router.put(
    '/:id',
    validateJWT,
    uploadSucursalImage.single('image'),
    validateUpdateSucursalRequest,
    updateSucursal
);

router.put('/:id/activar', validateSucursalStatusChange, changeSucursalStatus);
router.put('/:id/desactivar', validateSucursalStatusChange, changeSucursalStatus);

export default router;