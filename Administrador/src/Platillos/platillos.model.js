'use strict';

import mongoose from "mongoose";

const platillosSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del platillo es obligatorio'],
        required: true,
        maxlength: [100, 'El nombre no puede tener mas 100 caracteres'],
        trim: true,
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es obligatoria'],
        required: true,
        maxlength: [300, 'La descripción no puede tener mas 300 caracteres'],
        trim: true,
    },
    precio: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        required: true,
        min: [0, 'El precio no puede ser negativo'],
    },
    categoria: {
        type: String,
        required: [true, 'La categoría es obligatoria'],
        required: true,
        maxlength: [50, 'La categoría no puede tener mas 50 caracteres'],
        trim: true,
    },
    photo: {
        type: String,
        default: 'platillos/plato_kinaliani_nyvxo5',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
})

platillosSchema.index({ nombre: 1 }, { unique: true });
platillosSchema.index({ categoria: 1 });
platillosSchema.index({ isActive: 1, nombre: 1 });

export default mongoose.model('Platillos', platillosSchema);
