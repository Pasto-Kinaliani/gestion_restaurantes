'use strict';

import mongoose, { mongo } from "mongoose";

const pedidoSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    sucursal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sucursales',
        required: true
    },
    detalles: [{
        platillo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Platillo',
            required: true
        },
        nombre: {
            type: String,
            required: false
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    total: {
        type: Number,
        required: true,
        min: 0
    },
    metodoPago: {
        type: String,
        enum: ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'],
        required: true
    },
    status: {
        type: String,
        enum: ['PENDIENTE', 'COMPLETADO', 'CANCELADO'],
        default: 'PENDIENTE'
    }
}, { timestamps: true });

export default mongoose.model('Pedido', pedidoSchema);
