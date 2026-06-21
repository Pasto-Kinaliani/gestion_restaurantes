import { Router } from 'express';
import {
    createPedido,
    cancelPedido,
    //getPedidosPendientes,
    getPedidoById,
    getPedidosByUser
} from './pedidos.controller.js';

import {
    createPedidoValidator,
    getPedidoByIdValidator,
    cancelPedidoValidator
} from '../../middlewares/pedidos-validator.js';

const router = Router();

router.get('/usuario/:id', getPedidosByUser);

// POST
router.post('/createPedido', createPedidoValidator, createPedido);

// GET
//router.get('/', getPedidosPendientes);
router.get('/:id', getPedidoByIdValidator, getPedidoById);

// PUT
router.put('/cancelPedido/:id', cancelPedidoValidator, cancelPedido);

export default router;
