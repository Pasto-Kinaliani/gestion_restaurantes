import Empleado from './empleados.model.js';

export const getEmpleados = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive } = req.query;

        let filter = {};

        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        const empleados = await Empleado.find(filter)
            .limit(parseInt(limit))
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Empleado.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: empleados,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: Number(limit),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error', error });
    }
};

export const getEmpleadoById = async (req, res) => {
    try {
        const { id } = req.params;

        const empleado = await Empleado.findById(id);

        if (!empleado) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            empleado
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al buscar el empleado',
            error: err.message
        });
    }
};


export const saveEmpleado = async (req, res) => {
    try {
        const data = req.body;
        const empleado = new Empleado(data);
        await empleado.save();
        res.status(201).json({ success: true, message: 'Empleado guardado', empleado });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al guardar empleado', error });
    }
};

export const updateEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const empleado = await Empleado.findByIdAndUpdate(id, data, { new: true });
        res.status(200).json({ success: true, message: 'Empleado actualizado', empleado });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar', error });
    }
};

export const activateEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const empleado = await Empleado.findByIdAndUpdate(
            id,
            { status: true },
            { new: true }
        );

        if (!empleado) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });

        res.status(200).json({
            success: true,
            message: `El empleado ${empleado.name} ha sido activado`,
            empleado
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al activar empleado', error });
    }
};

export const deactivateEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const empleado = await Empleado.findByIdAndUpdate(
            id,
            { status: false },
            { new: true }
        );

        if (!empleado) return res.status(404).json({ success: false, message: 'Empleado no encontrado' });

        res.status(200).json({
            success: true,
            message: `El empleado ${empleado.name} ha sido desactivado`,
            empleado
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al desactivar empleado', error });
    }
};