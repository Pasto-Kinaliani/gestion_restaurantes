import { Router } from 'express';
import {
    createPedido,
    cancelPedido,
    getPedidosPendientes,
    getPedidoById,
    completPedido,
    getPedidosBySucursal,
    getPedidosByStatus,
    getPedidosByUsuario
} from './pedidos.controller.js';

import {
    createPedidoValidator,
    getPedidoByIdValidator,
    cancelPedidoValidator,
    completPedidoValidator,
    getPedidosByStatusValidator
} from '../../middlewares/pedidos-validator.js';

const router = Router();

// POST
router.post('/createPedido', createPedidoValidator, createPedido);

// GET
router.get('/', getPedidosPendientes);
router.get('/:id', getPedidoByIdValidator, getPedidoById);

// PUT
router.put('/cancelPedido/:id', cancelPedidoValidator, cancelPedido);
router.put('/completPedido/:id', completPedidoValidator, completPedido);

// GET
router.get('/status/:status', getPedidosByStatusValidator, getPedidosByStatus);
router.get('/sucursal/:sucursalId', getPedidosBySucursal);
router.get('/usuario/:usuarioId', getPedidosByUsuario);
export default router;
