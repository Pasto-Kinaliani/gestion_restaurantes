import Venta from './ventas.model.js';
import Pedido from '../Pedidos/pedidos.model.js';

export const getVentasBySucursalYMes = async (req, res) => {
    try {
        const { idSucursal } = req.params;
        const { mes, anio } = req.query;

        if (!mes || !anio) {
            return res.status(400).json({ success: false, message: 'El mes y el año son obligatorios en la query' });
        }

        const fechaInicio = new Date(anio, mes - 1, 1);
        const fechaFin = new Date(anio, mes, 0, 23, 59, 59);

        const ventas = await Venta.find({
            fecha: { $gte: fechaInicio, $lte: fechaFin }
        }).populate({
            path: 'pedido',
            match: { sucursal: idSucursal } 
        });

        const ventasFiltradas = ventas.filter(venta => venta.pedido !== null);

        if (ventasFiltradas.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'No se encontraron ventas para esta sucursal en el periodo indicado' 
            });
        }

        res.status(200).json({
            success: true,
            total: ventasFiltradas.length,
            sucursal: idSucursal,
            mes,
            anio,
            data: ventasFiltradas
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el reporte de ventas',
            error: error.message
        });
    }
};

export const getVentas = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
        };
        const ventas = await Venta.find().limit(limit*1).skip((page - 1) * limit).sort(options.sort);
        const total = await Venta.countDocuments();

        res.status(200).json({
            success: true,
            message: 'Ventas obtenidas exitosamente',
            data: ventas,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),               
                totalItems: total,
                limit,
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener ventas',
            error: error.message
        });
    }
};

export const getVentaById = async (req, res) => {
    try {
        const { id } = req.params;
        const venta = await Venta.findById(id);

        if (!venta) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Venta obtenida exitosamente',
            data: venta
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la venta',
            error: error.message
        });
    }
}