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

// Configuración para permitir la carga de múltiples tipos de archivos
// Define los nombres exactos de los campos que esperarás desde el Frontend/Postman
const uploadSucursalFiles = uploadSucursalImage.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'flat', maxCount: 1 }
]);

// Rutas GET
router.get('/', getSucursales);
router.get('/:id', validateGetSucursalById, getSucursalById);

// Rutas POST
router.post(
    '/',
    validateJWT,
    uploadSucursalFiles, // Reemplazado .single por .fields
    validateCreateSucursal,
    createSucursal
);

// Rutas PUT - actualizar sucursal
router.put(
    '/:id',
    validateJWT,
    uploadSucursalFiles, // Reemplazado .single por .fields
    validateUpdateSucursalRequest,
    updateSucursal
);

router.put('/:id/activar', validateSucursalStatusChange, changeSucursalStatus);
router.put('/:id/desactivar', validateSucursalStatusChange, changeSucursalStatus);

export default router;