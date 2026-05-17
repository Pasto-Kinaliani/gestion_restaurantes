import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';

export const createPedidoValidator = [
    body('usuario')
        .notEmpty()
        .withMessage('El usuario es requerido')
        .isMongoId()
        .withMessage('Debe ser un ObjectId válido'),

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

export const getPedidosByStatusValidator = [
    param('status')
        .notEmpty()
        .withMessage('El estado es requerido')
        .isIn(['PENDIENTE', 'COMPLETADO', 'CANCELADO'])
        .withMessage('Estado inválido'),

    checkValidators
];

export const cancelPedidoValidator = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido'),

    checkValidators
];

export const completPedidoValidator = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido'),

    checkValidators
];
