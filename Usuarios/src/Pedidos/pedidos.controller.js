import Pedido from './pedidos.model.js';
import Platillo from '../Platillos/platillos.model.js';
import Sucursal from '../Sucursal/sucursal.model.js';

// Crear pedido
export const createPedido = async (req, res) => {
    try {
        const { usuario, detalles, sucursal } = req.body;
        let totalAcumulado = 0;
        const detallesConPrecio = [];

        for (const item of detalles) {
            const platilloDB = await Platillo.findById(item.platillo);

            if (!platilloDB || !platilloDB.isActive) {
                return res.status(404).json({
                    success: false,
                    message: `Platillo con ID ${item.platillo} no encontrado o inactivo`
                });
            }

            const subtotal = item.cantidad * platilloDB.precio;
            totalAcumulado += subtotal;

            detallesConPrecio.push({
                platillo: item.platillo,
                cantidad: item.cantidad,
                nombre: platilloDB.nombre,
                subtotal: subtotal
            });
        }

        const nuevoPedido = new Pedido({
            usuario,
            sucursal,
            detalles: detallesConPrecio,
            total: totalAcumulado,
            status: 'PENDIENTE'
        });

        await nuevoPedido.save();

        res.status(201).json({
            success: true,
            message: 'Pedido creado exitosamente',
            pedido: nuevoPedido
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear pedido',
            error: error.message
        });
    }
};

// Cancelar pedido
export const cancelPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const pedido = await Pedido.findByIdAndUpdate(
            id,
            { status: 'CANCELADO' },
            { new: true }
        );
        res.status(200).json({ success: true, message: 'Pedido cancelado', pedido });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al cancelar', error });
    }
};

// Obtener pedido por ID
export const getPedidoById = async (req, res) => {
    try {
        const { id } = req.params;

        const pedido = await Pedido.findById(id)
            .populate('usuario', 'name surname email');

        if (!pedido) {
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            pedido
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener pedido',
            error: error.message
        });
    }
};

export const getPedidosByUser = async (req, res) => {
    try {
        const { uid } = req.params;

        const pedidos = await Pedido.find({ usuario: uid })
            .populate({
                path: 'sucursal',
                model: 'Sucursales', // Nombre exacto del export de sucursal
                select: 'nombre direccion'
            })
            .populate({
                path: 'detalles.platillo',
                model: 'Platillos', // <--- AGREGAMOS LA "S" para que coincida con tu modelo
                select: 'nombre precio'
            });

        if (pedidos.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Este usuario aún no tiene pedidos registrados'
            });
        }

        res.status(200).json({
            success: true,
            totalPedidos: pedidos.length,
            pedidos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el historial de pedidos',
            error: error.message
        });
    }
};
