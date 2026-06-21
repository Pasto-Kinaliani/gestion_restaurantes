import Mesa from './mesas.model.js';
import Empleado from '../Empleados/empleados.model.js';

// GET: Obtener mesas por sucursal
export const getMesasBySucursal = async (req, res) => {
    try {
        const { idSucursal } = req.params;
        const mesas = await Mesa.find({ sucursal: idSucursal, status: true })
            .populate('empleado', 'name surname puesto');

        res.status(200).json({
            success: true,
            total: mesas.length,
            mesas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener mesas',
            error: error.message
        });
    }
};

// POST: Crear nueva mesa (Valida número duplicado SOLO dentro de la misma sucursal)
export const createMesa = async (req, res) => {
    try {
        const data = req.body;

        // 1. Validar que no exista otra mesa activa con el mismo número EN LA MISMA SUCURSAL
        const mesaDuplicada = await Mesa.findOne({
            numero: data.numero,
            sucursal: data.sucursal,
            status: true // Solo revisamos mesas activas
        });

        if (mesaDuplicada) {
            return res.status(400).json({
                success: false,
                message: `El número de mesa ${data.numero} ya está registrado en esta sucursal.`
            });
        }

        if (!data.estado) {
            data.estado = 'LIBRE';
        }

        const mesa = new Mesa(data);
        await mesa.save();

        res.status(201).json({
            success: true,
            message: 'Mesa creada exitosamente con su ubicación en el plano',
            mesa
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear la mesa',
            error: error.message
        });
    }
};

// PUT: Actualizar mesa (Valida número duplicado evitando colisiones consigo misma)
export const updateMesa = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // 1. Si se intenta cambiar el número o la sucursal, validamos que no choque con otra mesa
        if (data.numero || data.sucursal) {
            // Buscamos la mesa actual para rellenar los datos faltantes en la consulta
            const mesaActual = await Mesa.findById(id);
            if (!mesaActual) {
                return res.status(404).json({ success: false, message: 'Mesa no encontrada' });
            }

            const numeroAEvaluar = data.numero || mesaActual.numero;
            const sucursalAEvaluar = data.sucursal || mesaActual.sucursal;

            const mesaDuplicada = await Mesa.findOne({
                _id: { $ne: id }, // Que NO sea la misma mesa que estamos editando
                numero: numeroAEvaluar,
                sucursal: sucursalAEvaluar,
                status: true
            });

            if (mesaDuplicada) {
                return res.status(400).json({
                    success: false,
                    message: `No se puede actualizar. El número de mesa ${numeroAEvaluar} ya existe en esa sucursal.`
                });
            }
        }

        const mesa = await Mesa.findByIdAndUpdate(id, data, { new: true, runValidators: true })
            .populate('empleado', 'name surname puesto');

        res.status(200).json({
            success: true,
            message: 'Mesa actualizada correctamente',
            mesa
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar',
            error: error.message
        });
    }
};

// PUT: Asignar un empleado a la mesa
export const assignEmpleadoToMesa = async (req, res) => {
    try {
        const { idMesa } = req.params;
        const { idEmpleado } = req.body;

        const empleado = await Empleado.findById(idEmpleado);
        if (!empleado || !empleado.status) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado o está inactivo'
            });
        }

        if (empleado.puesto !== 'MESERO') {
            return res.status(400).json({
                success: false,
                message: `El empleado ${empleado.name} es ${empleado.puesto}. Solo se pueden asignar MESEROS a las mesas.`
            });
        }

        const mesa = await Mesa.findByIdAndUpdate(
            idMesa,
            { empleado: idEmpleado },
            { new: true }
        ).populate('empleado', 'name surname puesto');

        res.status(200).json({
            success: true,
            message: `Mesa asignada a ${empleado.name} exitosamente`,
            mesa
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en la asignación',
            error: error.message
        });
    }
};

// PUT: Desactivar mesa
export const deactivateMesa = async (req, res) => {
    try {
        const { id } = req.params;
        const mesa = await Mesa.findByIdAndUpdate(id, { status: false }, { new: true });

        res.status(200).json({
            success: true,
            message: 'Mesa desactivada correctamente',
            mesa
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al desactivar mesa',
            error: error.message
        });
    }
};

// PUT: Activar mesa
export const activateMesa = async (req, res) => {
    try {
        const { id } = req.params;

        // Opcional: Al reactivar una mesa, verificar que su número no esté ocupado actualmente
        const mesaActual = await Mesa.findById(id);
        if (mesaActual) {
            const duplicado = await Mesa.findOne({
                _id: { $ne: id },
                numero: mesaActual.numero,
                sucursal: mesaActual.sucursal,
                status: true
            });
            if (duplicado) {
                return res.status(400).json({
                    success: false,
                    message: `No se puede activar. El número de mesa ${mesaActual.numero} ya está siendo usado en esta sucursal.`
                });
            }
        }

        const mesa = await Mesa.findByIdAndUpdate(id, { status: true }, { new: true });

        res.status(200).json({
            success: true,
            message: 'Mesa activada exitosamente',
            mesa
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al activar mesa',
            error: error.message
        });
    }
};

// GET: Obtener todas las mesas del sistema
export const getAllMesas = async (req, res) => {
    try {
        const mesas = await Mesa.find({ status: true })
            .populate('sucursal', 'nombre direccion')
            .populate('empleado', 'name surname puesto');

        if (mesas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay mesas registradas en el sistema'
            });
        }

        res.status(200).json({
            success: true,
            total: mesas.length,
            mesas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el listado general de mesas',
            error: error.message
        });
    }
};