import Sucursales from './sucursal.model.js';

// Función para calcular el estado según la hora
const obtenerEstadoSucursal = (apertura, cierre) => {
  if (!apertura || !cierre) return "Horario no definido";

  const ahora = new Date();

  const [horaA, minA] = apertura.split(":").map(Number);
  const [horaC, minC] = cierre.split(":").map(Number);

  const aperturaDate = new Date();
  aperturaDate.setHours(horaA, minA, 0);

  const cierreDate = new Date();
  cierreDate.setHours(horaC, minC, 0);

  if (ahora < aperturaDate) return "Cerrado";

  if (ahora >= aperturaDate && ahora < cierreDate) {
    const diferenciaMinutos = (cierreDate - ahora) / 60000;

    if (diferenciaMinutos <= 60) return "Cierra pronto";

    return "Abierto";
  }

  return "Cerrado";
};


// Obtener todas las sucursales con paginación y filtros
export const getSucursales = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;

    let filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const sucursales = await Sucursales.find(filter)
      .limit(parseInt(limit))
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Sucursales.countDocuments(filter);

    const sucursalesConEstado = sucursales.map((sucursal) => ({
      ...sucursal._doc,
      estado: sucursal.horario
        ? obtenerEstadoSucursal(
          sucursal.horario.apertura,
          sucursal.horario.cierre
        )
        : "Horario no definido",
    }));

    res.status(200).json({
      success: true,
      data: sucursalesConEstado,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las sucursales',
      error: error.message,
    });
  }
};


// Obtener sucursal por ID
export const getSucursalById = async (req, res) => {
  try {
    const { id } = req.params;

    const sucursal = await Sucursales.findById(id);

    if (!sucursal) {
      return res.status(404).json({
        success: false,
        message: 'Sucursal no encontrada',
      });
    }

    const sucursalConEstado = {
      ...sucursal._doc,
      estado: sucursal.horario
        ? obtenerEstadoSucursal(
          sucursal.horario.apertura,
          sucursal.horario.cierre
        )
        : "Horario no definido",
    };

    res.status(200).json({
      success: true,
      data: sucursalConEstado,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la sucursal',
      error: error.message,
    });
  }
};


// Crear nueva sucursal
export const createSucursal = async (req, res) => {
  try {
    const sucursalData = req.body;

    if (req.file) {
      const extension = req.file.path.split('.').pop();
      const filename = req.file.filename;
      const relativePath = filename.substring(filename.indexOf('sucursales/'));

      sucursalData.photo = `${relativePath}.${extension}`;
    } else {
      // Si no se envía archivo, usar imagen por defecto
      sucursalData.photo = 'sucursales/plato_kinaliani_nyvxo5';
    }

    const sucursal = new Sucursales(sucursalData);
    await sucursal.save();

    res.status(201).json({
      success: true,
      message: 'Sucursal creada exitosamente',
      data: sucursal,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear la sucursal',
      error: error.message,
    });
  }
};


// Actualizar sucursal
export const updateSucursal = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      const currentSucursal = await Sucursales.findById(id);

      if (currentSucursal && currentSucursal.photo) {
        const photoPath = currentSucursal.photo;
        const photoWithoutExt = photoPath.substring(
          0,
          photoPath.lastIndexOf('.')
        );
        const publicId = `Gestion_Restaurantes/${photoWithoutExt}`;

        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (deleteError) {
          console.error(
            `Error al eliminar imagen anterior de Cloudinary: ${deleteError.message}`
          );
        }
      }

      const extension = req.file.path.split('.').pop();
      const filename = req.file.filename;
      const relativePath = filename.includes('sucursales/')
        ? filename.substring(filename.indexOf('sucursales/'))
        : filename;
      updateData.photo = `${relativePath}.${extension}`;
    }

    const sucursal = await Sucursales.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!sucursal) {
      return res.status(404).json({
        success: false,
        message: 'Sucursal no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sucursal actualizada exitosamente',
      data: sucursal,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar la sucursal',
      error: error.message,
    });
  }
};


// Cambiar estado de la sucursal (activar/desactivar)
export const changeSucursalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const isActive = req.url.includes('/activar');
    const action = isActive ? 'activada' : 'desactivada';

    const sucursal = await Sucursales.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!sucursal) {
      return res.status(404).json({
        success: false,
        message: 'Sucursal no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: `Sucursal ${action} exitosamente`,
      data: sucursal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado de la sucursal',
      error: error.message,
    });
  }
};