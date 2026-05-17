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

export const assignEmpleadoToMesa = async (req, res) => {
    try {
        const { idMesa } = req.params;
        const { idEmpleado } = req.body;

        // 1. Verificar si el empleado existe y está activo
        const empleado = await Empleado.findById(idEmpleado);
        if (!empleado || !empleado.status) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado o está inactivo'
            });
        }

        // 2. Validar que el puesto sea exactamente 'MESERO'
        if (empleado.puesto !== 'MESERO') {
            return res.status(400).json({
                success: false,
                message: `El empleado ${empleado.name} es ${empleado.puesto}. Solo se pueden asignar MESEROS a las mesas.`
            });
        }

        // 3. Realizar la asignación
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

export const createMesa = async (req, res) => {
    try {
        const data = req.body;
        const mesa = new Mesa(data);
        await mesa.save();

        res.status(201).json({
            success: true,
            message: 'Mesa creada exitosamente',
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

// PUT: Actualizar mesa (capacidad, numero, etc)
export const updateMesa = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const mesa = await Mesa.findByIdAndUpdate(id, data, { new: true });

        res.status(200).json({
            success: true,
            message: 'Mesa actualizada',
            mesa
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar',
            error
        });
    }
};

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

export const activateMesa = async (req, res) => {
    try {
        const { id } = req.params;
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