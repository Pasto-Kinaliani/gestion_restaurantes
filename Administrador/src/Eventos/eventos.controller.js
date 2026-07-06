import Evento from './eventos.model.js';

export const getEventos = async (req, res) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        const query = {};

        const [total, eventos] = await Promise.all([
            Evento.countDocuments(query),
            Evento.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
                .sort({ fechaHoraInicio: 1 })
        ]);

        res.status(200).json({
            success: true,
            total,
            eventos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener los eventos',
            error: error.message
        });
    }
};

export const getEventoById = async (req, res) => {
    try {
        const { id } = req.params;
        const evento = await Evento.findById(id);

        if (!evento) {
            return res.status(404).json({
                success: false,
                msg: 'Evento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            evento
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al obtener el evento',
            error: error.message
        });
    }
};

export const createEvento = async (req, res) => {
    try {
        const data = req.body;
        
        if (req.file) {
            data.photo = req.file.filename;
        }

        const evento = new Evento(data);
        await evento.save();

        res.status(201).json({
            success: true,
            msg: 'Evento creado exitosamente',
            evento
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al crear el evento',
            error: error.message
        });
    }
};

export const updateEvento = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (req.file) {
            data.photo = req.file.filename;
        }

        const evento = await Evento.findByIdAndUpdate(id, data, { new: true });

        res.status(200).json({
            success: true,
            msg: 'Evento actualizado exitosamente',
            evento
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar el evento',
            error: error.message
        });
    }
};

export const changeEventoStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const evento = await Evento.findById(id);

        if (!evento) {
            return res.status(404).json({
                success: false,
                msg: 'Evento no encontrado'
            });
        }

        evento.isActive = !evento.isActive;
        await evento.save();

        res.status(200).json({
            success: true,
            msg: 'Estado del evento actualizado exitosamente',
            evento
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error al cambiar el estado del evento',
            error: error.message
        });
    }
};
