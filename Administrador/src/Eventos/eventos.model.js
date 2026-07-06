'use strict';

import mongoose from "mongoose";

const eventoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del evento es obligatorio'],
        maxlength: [100, 'El nombre no puede tener mas de 100 caracteres'],
        trim: true,
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        maxlength: [500, 'La descripción no puede tener mas de 500 caracteres'],
        trim: true,
    },
    tipoEvento: {
        type: String,
        required: [true, 'El tipo de evento es obligatorio'],
        enum: ['Cena Temática', 'Promoción', 'Degustación', 'Festival Gastronómico', 'Otro'],
        default: 'Otro'
    },
    fechaHoraInicio: {
        type: Date,
        required: [true, 'La fecha y hora de inicio son obligatorias']
    },
    fechaHoraFin: {
        type: Date,
        required: [true, 'La fecha y hora de fin son obligatorias']
    },
    recursos: {
        type: [String],
        default: []
    },
    photo: {
        type: String,
        default: 'eventos/evento_default_nyvxo5',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true
});

eventoSchema.index({ nombre: 1 }, { unique: true });
eventoSchema.index({ tipoEvento: 1 });
eventoSchema.index({ isActive: 1, fechaHoraInicio: 1 });

export default mongoose.model('Eventos', eventoSchema);
