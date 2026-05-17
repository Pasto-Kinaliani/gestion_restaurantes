import Inventario from './inventario.model.js';

// Obtener todo el inventario con paginación y filtros
export const getInventarios = async (req, res) => {
    try {

        const { estado, sucursal } = req.query;

        let filtro = {};

        if (estado) filtro.estado = estado;
        if (sucursal) filtro.sucursal = sucursal;

        const inventarios = await Inventario.find(filtro)
            .populate('sucursal');

        return res.status(200).json({
            success: true,
            total: inventarios.length,
            inventarios
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener inventario',
            error: err.message
        });
    }
};

// Obtener inventario por ID
export const getInventarioById = async (req, res) => {
  try {
    const { id } = req.params;

    const inventario = await Inventario.findById(id);

    if (!inventario) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: inventario,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el producto',
      error: error.message,
    });
  }
};

// Crear nuevo producto
export const createInventario = async (req, res) => {
  try {
    const inventarioData = req.body;

    const inventario = new Inventario(inventarioData);
    await inventario.save();

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: inventario,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear el producto',
      error: error.message,
    });
  }
};

// Actualizar producto
export const updateInventario = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const inventario = await Inventario.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!inventario) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: inventario,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar el producto',
      error: error.message,
    });
  }
};

// Cambiar estado del producto (activar/desactivar)
export const changeInventarioStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const isActivar = req.url.includes('/activar');
    const action = isActivar ? 'activado' : 'desactivado';
    const nuevoEstado = isActivar ? 'disponible' : 'agotado';

    const inventario = await Inventario.findByIdAndUpdate(
      id,
      { estado: nuevoEstado },
      { new: true }
    );

    if (!inventario) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: `Producto ${action} exitosamente`,
      data: inventario,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado del producto',
      error: error.message,
    });
  }
};