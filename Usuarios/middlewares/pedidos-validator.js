import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';

export const createPedidoValidator = [
    body('usuario')
        .notEmpty()
        .withMessage('El usuario es requerido'),

    body('detalles')
        .isArray({ min: 1 })
        .withMessage('Los detalles deben ser un array con al menos un elemento'),

    checkValidators
];

export const getPedidoByIdValidator = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido'),

    checkValidators
];

export const cancelPedidoValidator = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido'),

    checkValidators
];
