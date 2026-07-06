import Evento from './eventos.model.js';

export const getEventos = async (req, res) => {
    try {
        const { limite = 10, desde = 0 } = req.query;
        // Solo obtener eventos activos para los usuarios
        const query = { isActive: true };

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
        const evento = await Evento.findOne({ _id: id, isActive: true });

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
