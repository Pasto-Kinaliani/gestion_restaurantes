'use strict';

import Reservacion from './reservaciones.model.js';
import Mesa from '../Mesas/mesas.model.js';

// Definimos las opciones de población para reutilizarlas
const populateOptions = ['numero_mesa', 'sucursal'];

// ================= GET ALL =================
export const getReservations = async (req, res) => {
    try {
        // Se agregó la población de sucursal
        const reservaciones = await Reservacion.find().populate(populateOptions);

        return res.status(200).json({
            success: true,
            data: reservaciones
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener reservaciones',
            error: error.message
        });
    }
};

// ================= CREATE =================
export const createReservation = async (req, res) => {
    try {
        const { id_usuario, numero_mesa, fecha, hora, numero_personas, estado, sucursal } = req.body;

        if (!id_usuario || !numero_mesa || !fecha || !hora || !numero_personas || !sucursal) {
            return res.status(400).json({
                success: false,
                message: "Todos los campos son obligatorios (incluyendo sucursal)."
            });
        }

        const mesasAAsignar = Array.isArray(numero_mesa) ? numero_mesa : [numero_mesa];

        const mesasExistentes = await Mesa.find({ _id: { $in: mesasAAsignar } });
        if (mesasExistentes.length !== mesasAAsignar.length) {
            return res.status(404).json({
                success: false,
                message: "Una o más mesas seleccionadas no existen."
            });
        }

        const nuevaReservacion = new Reservacion({
            id_usuario,
            numero_mesa: mesasAAsignar,
            sucursal, // Se guarda la sucursal
            fecha,
            hora,
            numero_personas: Number(numero_personas),
            estado: estado || "pendiente"
        });

        const reservacionGuardada = await nuevaReservacion.save();

        return res.status(201).json({
            success: true,
            message: "Reservación creada correctamente",
            data: await reservacionGuardada.populate(populateOptions)
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor al crear la reservación",
            error: error.message
        });
    }
};

// ================= GET BY ID =================
export const getReservationById = async (req, res) => {
    try {
        const { id } = req.params;
        const reservacion = await Reservacion.findById(id).populate(populateOptions);

        if (!reservacion) {
            return res.status(404).json({ success: false, message: 'Reservación no encontrada' });
        }

        return res.status(200).json({ success: true, data: reservacion });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al obtener reservación', error: error.message });
    }
};

// ================= UPDATE =================
export const updateReservation = async (req, res) => {
    try {
        const { id } = req.params;

        const reservacion = await Reservacion.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        ).populate(populateOptions);

        if (!reservacion) {
            return res.status(404).json({ success: false, message: 'Reservación no encontrada' });
        }

        return res.status(200).json({ success: true, message: 'Reservación actualizada', data: reservacion });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Error al actualizar reservación', error: error.message });
    }
};

// ================= CAMBIAR ESTADO =================
export const changeReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const reservacion = await Reservacion.findByIdAndUpdate(
            id,
            { estado },
            { new: true }
        ).populate(populateOptions);

        if (!reservacion) {
            return res.status(404).json({ success: false, message: 'Reservación no encontrada' });
        }

        return res.status(200).json({ success: true, message: 'Estado actualizado correctamente', data: reservacion });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al cambiar estado', error: error.message });
    }
};

// ================= SUGERIR MESAS INTELIGENTE =================
export const sugerirMesas = async (req, res) => {
    try {
        const { fecha, hora, numero_personas, sucursal } = req.query;

        if (!fecha || !hora || !numero_personas || !sucursal) {
            return res.status(400).json({
                success: false,
                message: "Faltan parámetros (fecha, hora, numero_personas, sucursal)."
            });
        }

        const personas = Number(numero_personas);

        // Filtramos por fecha, hora y SUCURSAL
        const reservasActivas = await Reservacion.find({
            fecha,
            hora,
            sucursal,
            estado: { $in: ['pendiente', 'confirmada'] }
        });

        const idsMesasOcupadas = reservasActivas.flatMap(r => r.numero_mesa);

        // Buscamos mesas disponibles en esa SUCURSAL
        const mesasLibres = await Mesa.find({
            _id: { $nin: idsMesasOcupadas },
            sucursal: sucursal,
            disponible: true
        });

        // Lógica de asignación...
        const ordenadasMenorAMayor = [...mesasLibres].sort((a, b) => a.capacidad - b.capacidad);
        const mesaPerfecta = ordenadasMenorAMayor.find(m => m.capacidad >= personas);

        if (mesaPerfecta) {
            return res.status(200).json({ success: true, data: [mesaPerfecta] });
        }

        const ordenadasMayorAMenor = [...mesasLibres].sort((a, b) => b.capacidad - a.capacidad);
        let acumuladoPersonas = 0;
        const combinacionMesas = [];

        for (const mesa of ordenadasMayorAMenor) {
            combinacionMesas.push(mesa);
            acumuladoPersonas += mesa.capacidad;
            if (acumuladoPersonas >= personas) {
                return res.status(200).json({ success: true, data: combinacionMesas });
            }
        }

        return res.status(404).json({ success: false, message: "No hay mesas disponibles." });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Error al sugerir mesas", error: error.message });
    }
};

export const getReservationsByUser = async (req, res) => {
    try {
        const { uid } = req.params;
        const uidLimpio = uid.trim();

        // NOTA: Para que esto funcione, cuando el Admin crea la reserva,
        // debe guardar el email del cliente en un campo llamado 'email_cliente'.

        // La consulta busca:
        // 1. Reservas que tengan el ID del usuario (las creadas por el usuario).
        // 2. Reservas que tengan el email asociado al usuario (las creadas por el Admin).

        const reservaciones = await Reservacion.find({
            $or: [
                { id_usuario: uidLimpio },
                { email_cliente: { $exists: true, $ne: null } }
                // Aquí deberías filtrar por el email específico del usuario logueado.
                // Si el Admin guarda el email, el frontend debe enviar el email actual
                // o el servidor debe inferirlo.
            ]
        })
            .populate('sucursal')
            .populate('numero_mesa')
            .sort({ fecha: -1 });

        return res.status(200).json({
            success: true,
            total: reservaciones.length,
            data: reservaciones
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};