import { body, param } from 'express-validator';
import { checkValidators } from './check-validators.js';

// ================= CREATE =================
export const validateCreateReservation = [
    body('id_usuario')
        .notEmpty()
        .withMessage('El id del usuario es obligatorio'),

    body('numero_mesa')
        .notEmpty()
        .withMessage('El id de la mesa es obligatorio') // 👈 Corregido mensaje
        .isMongoId()
        .withMessage('Debe ser un ObjectId válido'),

    body('fecha')
        .notEmpty()
        .withMessage('La fecha es obligatoria')
        .isISO8601()
        .withMessage('La fecha debe ser válida')
        .toDate(),

    body('hora')
        .notEmpty()
        .withMessage('La hora es obligatoria')
        .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('Formato de hora inválido HH:mm'),

    body('numero_personas')
        .notEmpty()
        .withMessage('Número de personas obligatorio')
        .isInt({ min: 1 })
        .withMessage('Debe ser un número mayor a 0'),

    body('estado')
        .optional()
        .isIn(['pendiente', 'confirmada', 'cancelada'])
        .withMessage('Estado inválido'),

    checkValidators,
];

// ================= UPDATE =================
export const validateUpdateReservation = [
    body('numero_mesa')
        .optional() // 👈 Importante añadir optional para actualizaciones parciales
        .isMongoId()
        .withMessage('Debe ser un ObjectId válido'),

    body('fecha')
        .optional()
        .isISO8601()
        .withMessage('Fecha inválida')
        .toDate(),

    body('hora')
        .optional()
        .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('Formato de hora inválido HH:mm'),

    body('numero_personas')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Debe ser un número mayor a 0'),

    body('estado')
        .optional()
        .isIn(['pendiente', 'confirmada', 'cancelada'])
        .withMessage('Estado inválido'),

    checkValidators,
];

// ================= GET BY ID =================
export const validateGetReservationById = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido'),

    checkValidators,
];

// ================= CAMBIAR ESTADO =================
export const validateReservationStatusChange = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido'),

    body('estado')
        .notEmpty()
        .withMessage('El estado es obligatorio')
        .isIn(['pendiente', 'confirmada', 'cancelada'])
        .withMessage('Estado inválido'),

    checkValidators,
];