import { check, param } from 'express-validator';
import { checkValidators } from './check-validators.js';
import Evento from '../src/Eventos/eventos.model.js';

export const validateCreateEvento = [
    check('nombre', 'El nombre del evento es obligatorio').not().isEmpty(),
    check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
    check('tipoEvento', 'El tipo de evento es obligatorio').not().isEmpty(),
    check('fechaHoraInicio', 'La fecha de inicio es obligatoria').isISO8601(),
    check('fechaHoraFin', 'La fecha de fin es obligatoria').isISO8601(),
    checkValidators
];

export const validateUpdateEventoRequest = [
    param('id', 'No es un ID válido').isMongoId(),
    param('id').custom(async (id) => {
        const evento = await Evento.findById(id);
        if (!evento) {
            throw new Error(`El evento con el id ${id} no existe`);
        }
    }),
    check('nombre', 'El nombre no puede estar vacio si se envía').optional().not().isEmpty(),
    check('descripcion', 'La descripcion no puede estar vacia si se envía').optional().not().isEmpty(),
    check('fechaHoraInicio', 'La fecha de inicio debe ser valida si se envía').optional().isISO8601(),
    check('fechaHoraFin', 'La fecha de fin debe ser valida si se envía').optional().isISO8601(),
    checkValidators
];

export const validateEventoStatusChange = [
    param('id', 'No es un ID válido').isMongoId(),
    param('id').custom(async (id) => {
        const evento = await Evento.findById(id);
        if (!evento) {
            throw new Error(`El evento con el id ${id} no existe`);
        }
    }),
    checkValidators
];

export const validateGetEventoById = [
    param('id', 'No es un ID válido').isMongoId(),
    param('id').custom(async (id) => {
        const evento = await Evento.findById(id);
        if (!evento) {
            throw new Error(`El evento con el id ${id} no existe`);
        }
    }),
    checkValidators
];
