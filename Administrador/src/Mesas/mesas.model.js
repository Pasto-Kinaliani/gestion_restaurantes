import { Schema, model } from 'mongoose';

const mesaSchema = Schema({
    numero: {
        type: Number,
        required: [true, 'El número de mesa es obligatorio'],
    },
    capacidad: {
        type: Number,
        required: [true, 'La capacidad es obligatoria'],
        min: [1, 'La capacidad mínima es de 1 persona']
    },
    sucursal: {
        type: Schema.Types.ObjectId,
        ref: 'Sucursales',
        required: [true, 'La sucursal es obligatoria']
    },
    empleado: {
        type: Schema.Types.ObjectId,
        ref: 'Empleado',
        required: false
    },
    // 1. ESTADO DE LA MESA (Libre, Ocupada, Reservada)
    estado: {
        type: String,
        enum: ['LIBRE', 'OCUPADA', 'RESERVADA'],
        default: 'LIBRE'
    },
    // 2. COORDENADAS PARA EL MAPA DINÁMICO (En porcentajes de 0 a 100)
    posicion: {
        x: { type: Number, required: true, default: 0 },
        y: { type: Number, required: true, default: 0 }
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    status: {
        type: Boolean,
        default: true
    }
}, { versionKey: false, timestamps: true });

export default model('Mesa', mesaSchema);