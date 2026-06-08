import { Router } from 'express';
import { getMyProfile, createAccount, updateAccount, deactivateAccount } from './usuarios.controller.js';
import { createAccountValidator } from '../../middlewares/usuarios-validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js'; 

const router = Router();

// RUTA PÚBLICA: No lleva validateJWT
router.post('/register', createAccountValidator, createAccount); 

// RUTAS PROTEGIDAS: Agregamos validateJWT como segundo parámetro
router.get('/profile', validateJWT, getMyProfile); 
router.put('/update', validateJWT, updateAccount); 
router.put('/deactivate', validateJWT, deactivateAccount); 

export default router;