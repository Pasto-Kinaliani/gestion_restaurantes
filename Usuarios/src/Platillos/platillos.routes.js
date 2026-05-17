import { Router } from 'express';
import {
    getPlatillos

} from './platillos.controller.js';


const router = Router();

// Rutas GET
router.get('/', getPlatillos);

export default router;
