import { Router } from 'express';
import { getMesasBySucursal, getAllAvailableMesas } from './mesas.controller.js';

const router = Router();

// IMPORTANTE: Pon la ruta sin parámetros PRIMERO
router.get('/', getAllAvailableMesas); 

// Luego la ruta con parámetros
router.get('/sucursal/:idSucursal', getMesasBySucursal);

export default router;