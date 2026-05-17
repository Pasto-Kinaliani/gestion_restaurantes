import Pedido from './pedidos.model.js';
import Platillo from '../Platillos/platillos.model.js';

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

export const completPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const pedido = await Pedido.findByIdAndUpdate(
            id,
            { status: 'COMPLETADO' },
            { new: true }
        );
        res.status(200).json({ success: true, message: 'Pedido completado', pedido });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al completar', error });
    }
};

// Obtener pedidos pendientes
export const getPedidosPendientes = async (req, res) => {
    try {
        const pedidos = await Pedido.find({ status: { $in: ['PENDIENTE', 'COMPLETADO', 'CANCELADO'] } })
            .populate('usuario', 'name surname email');

        res.status(200).json({
            success: true,
            total: pedidos.length,
            pedidos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener pedidos pendientes',
            error: error.message
        });
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

// Obtener pedidos por sucursal
export const getPedidosBySucursal = async (req, res) => {
    try {
        const { sucursalId } = req.params;

        const pedidos = await Pedido.find({ sucursal: sucursalId })
            .populate('usuario', 'name surname email')
            .populate('sucursal', 'nombre direccion');

        res.status(200).json({
            success: true,
            total: pedidos.length,
            pedidos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener pedidos por sucursal',
            error: error.message
        });
    }
};

// Obtener pedidos por estado (PENDIENTE, COMPLETADO, CANCELADO)
export const getPedidosByStatus = async (req, res) => {
    try {
        const { status } = req.params; // Se espera: "PENDIENTE", "COMPLETADO", "CANCELADO"

        // Validar que el status sea válido
        const estadosValidos = ['PENDIENTE', 'COMPLETADO', 'CANCELADO'];
        if (!estadosValidos.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Estado inválido. Los estados válidos son: ${estadosValidos.join(', ')}`
            });
        }

        const pedidos = await Pedido.find({ status })
            .populate('usuario', 'name surname email')
            .populate('sucursal', 'nombre direccion');

        res.status(200).json({
            success: true,
            total: pedidos.length,
            pedidos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener pedidos por estado',
            error: error.message
        });
    }
};
