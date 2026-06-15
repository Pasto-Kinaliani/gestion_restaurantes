import Mesa from './mesas.model.js';

export const getMesasBySucursal = async (req, res) => {
    try {
        const { idSucursal } = req.params;
        
        // AGREGA EL .populate AQUÍ
        const mesas = await Mesa.find({ 
            sucursal: idSucursal, 
            status: true, 
            isAvailable: true 
        }).populate('sucursal', 'nombre direccion'); 

        res.status(200).json({
            success: true,
            total: mesas.length,
            mesas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener mesas para reservación',
            error: error.message
        });
    }
};

export const getAllAvailableMesas = async (req, res) => {
    try {
        // Buscamos todas las mesas disponibles sin filtrar por sucursal
        const mesas = await Mesa.find({ 
            status: true, 
            isAvailable: true 
        }).populate('sucursal', 'nombre direccion');

        res.status(200).json({
            success: true,
            total: mesas.length,
            mesas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el listado global de mesas',
            error: error.message
        });
    }
};