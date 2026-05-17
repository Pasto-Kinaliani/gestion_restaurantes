import Platillos from './platillos.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';

// Obtener todos los platillos con paginación y filtros
export const getPlatillos = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;

    let filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
    };

    const platillos = await Platillos.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(options.sort);

    const total = await Platillos.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: platillos,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los platillos',
      error: error.message,
    });
  }
};

// Obtener platillo por ID
export const getPlatilloById = async (req, res) => {
  try {
    const { id } = req.params;

    const platillo = await Platillos.findById(id);

    if (!platillo) {
      return res.status(404).json({
        success: false,
        message: 'Platillo no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: platillo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el platillo',
      error: error.message,
    });
  }
};

// Crear nuevo platillo
export const createPlatillo = async (req, res) => {
  try {
    const platilloData = req.body;

    if (req.file) {
      const extension = req.file.path.split('.').pop();
      const filename = req.file.filename;
      const relativePath = filename.substring(filename.indexOf('fields/'));

      platilloData.photo = `${relativePath}.${extension}`;
    } else {
      // Si no se envía archivo, usar imagen por defecto
      platilloData.photo = 'platillos/plato_kinaliani_nyvxo5';
    }

    const platillo = new Platillos(platilloData);
    await platillo.save();

    res.status(201).json({
      success: true,
      message: 'Platillo creado exitosamente',
      data: platillo,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear el platillo',
      error: error.message,
    });
  }
};

// Actualizar platillo
export const updatePlatillo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.file) {
      const currentPlatillo = await Platillos.findById(id);

      if (currentPlatillo && currentPlatillo.photo) {
        const photoPath = currentPlatillo.photo;
        const photoWithoutExt = photoPath.substring(
          0,
          photoPath.lastIndexOf('.')
        );
        const publicId = `PASTO_KINALIANI/${photoWithoutExt}`;

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
      const relativePath = filename.includes('platillos/')
        ? filename.substring(filename.indexOf('platillos/'))
        : filename;
      updateData.photo = `${relativePath}.${extension}`;
    }

    const platillo = await Platillos.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!platillo) {
      return res.status(404).json({
        success: false,
        message: 'Platillo no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Platillo actualizado exitosamente',
      data: platillo,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar el platillo',
      error: error.message,
    });
  }
};

// Cambiar estado del platillo (activar/desactivar)
export const changePlatilloStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const isActive = req.url.includes('/activar');
    const action = isActive ? 'activado' : 'desactivado';

    const platillo = await Platillos.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!platillo) {
      return res.status(404).json({
        success: false,
        message: 'Platillo no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: `Platillo ${action} exitosamente`,
      data: platillo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado del platillo',
      error: error.message,
    });
  }
};
