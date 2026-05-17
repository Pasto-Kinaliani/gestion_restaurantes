import { Router } from "express";
import { getVentas, getVentaById, getVentasBySucursalYMes } from "./ventas.controller.js";
import { getVentaByIdValidator } from "../../middlewares/ventas-validators.js";
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

router.get('/', 
    getVentas);

router.get('/:id', 
    getVentaByIdValidator, 
    getVentaById);

router.get('/sucursal/:idSucursal',   
 getVentasBySucursalYMes);

export default router;