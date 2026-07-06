import Mesa from './mesas.model.js';

// GET: Obtener mesas por sucursal
export const getMesasBySucursal = async (req, res) => {
    try {
        const { idSucursal } = req.params;
        const mesas = await Mesa.find({ sucursal: idSucursal, status: true })
            .populate('sucursal', 'nombre direccion flat');

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

// export const getAllMesas = async (req, res) => {
//     try {
//         const mesas = await Mesa.find({ status: true })
//             .populate('sucursal', 'nombre direccion')
//             // .populate('empleado', 'name surname puesto');

//         // ... resto de tu código
//     } catch (error) {
//         console.log("--- ERROR DETALLADO EN BACKEND ---");
//         console.error(error); // ESTO TE DIRÁ SI EL PROBLEMA ES EL POPULATE
//         res.status(500).json({
//             success: false,
//             message: 'Error al obtener el listado general de mesas',
//             error: error.message
//         });
//     }
// };

export const getAllMesas = async (req, res) => {
    try {
        const mesas = await Mesa.find({ status: true })
            .populate('sucursal', 'nombre direccion')
            // .populate('empleado', 'name surname puesto');

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