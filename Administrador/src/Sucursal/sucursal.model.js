'use strict';

import mongoose from "mongoose";

const sucursalSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la sucursal es obligatorio'],
        maxlength: [100, 'El nombre no puede tener mas de 100 caracteres'],
        trim: true,
    },
    direccion: {
        type: String,
        required: [true, 'La dirección es obligatoria'],
        maxlength: [300, 'La dirección no puede tener mas de 300 caracteres'],
        trim: true,
    },
    telefono: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
        maxlength: [20, 'El teléfono no puede tener mas de 20 caracteres'],
        trim: true,
    },
    horario: {
        apertura: {
            type: String,
            required: [true, 'La hora de apertura es obligatoria'],
        },
        cierre: {
            type: String,
            required: [true, 'La hora de cierre es obligatoria'],
        }
    },
    photo: {
        type: String,
        default: 'sucursales/plato_kinaliani_nyvxo5',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
},
    {
        timestamps: true
    });

sucursalSchema.index({ nombre: 1 }, { unique: true });
sucursalSchema.index({ isActive: 1, nombre: 1 });

export default mongoose.model('Sucursales', sucursalSchema);