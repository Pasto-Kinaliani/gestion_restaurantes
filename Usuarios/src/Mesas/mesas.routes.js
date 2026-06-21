import { Router } from 'express';
import { getMesasBySucursal, getAllMesas } from './mesas.controller.js';

const router = Router();

router.get('/sucursal/:idSucursal', getMesasBySucursal);
router.get('/listado', getAllMesas);

export default router; 