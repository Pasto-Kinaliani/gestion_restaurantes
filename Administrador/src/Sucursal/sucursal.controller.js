'use strict';

import Sucursales from './sucursal.model.js';
import cloudinary from 'cloudinary'; // Asegúrate de tener la importación si manejas borrados

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

// ==========================================
// Crear nueva sucursal (Corregido)
// ==========================================
export const createSucursal = async (req, res) => {
  try {
    const sucursalData = { ...req.body };

    // Procesar la foto de fachada si viene en la petición
    if (req.files && req.files.photo) {
      const filePhoto = req.files.photo[0];
      // Si usas multer-storage-cloudinary, filePhoto.filename ya es el public_id o relative path exacto
      const filename = filePhoto.filename;
      const relativePath = filename.includes('sucursales/')
        ? filename.substring(filename.indexOf('sucursales/'))
        : filename;

      // Validamos si ya incluye extensión para no duplicarla (.jpg.jpg)
      const extension = filePhoto.path.split('.').pop();
      sucursalData.photo = relativePath.endsWith(`.${extension}`) ? relativePath : `${relativePath}.${extension}`;
    } else {
      // 🚨 IMPORTANTE: Se añade la extensión por defecto para que Cloudinary no responda 404
      sucursalData.photo = 'sucursales/plato_kinaliani_nyvxo5.png';
    }

    // Procesar el plano (flat) si viene en la petición
    if (req.files && req.files.flat) {
      const fileFlat = req.files.flat[0];
      const filename = fileFlat.filename;
      const relativePath = filename.includes('sucursales/')
        ? filename.substring(filename.indexOf('sucursales/'))
        : filename;

      const extension = fileFlat.path.split('.').pop();
      sucursalData.flat = relativePath.endsWith(`.${extension}`) ? relativePath : `${relativePath}.${extension}`;
    } else {
      // 🚨 IMPORTANTE: Caída por defecto estructurada con su extensión
      sucursalData.flat = 'sucursales/plato_kinaliani_nyvxo5.png';
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

// ==========================================
// Actualizar sucursal (Corregido)
// ==========================================
export const updateSucursal = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.files && (req.files.photo || req.files.flat)) {
      const currentSucursal = await Sucursales.findById(id);

      if (!currentSucursal) {
        return res.status(404).json({
          success: false,
          message: 'Sucursal no encontrada',
        });
      }

      // 1. Reemplazo de PHOTO
      if (req.files.photo) {
        // Validación estricta incluyendo la extensión por defecto corregida
        if (currentSucursal.photo && currentSucursal.photo !== 'sucursales/plato_kinaliani_nyvxo5.png') {
          const photoPath = currentSucursal.photo;
          const photoWithoutExt = photoPath.substring(0, photoPath.lastIndexOf('.'));
          const publicId = `Gestion_Restaurantes/${photoWithoutExt}`;

          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (deleteError) {
            console.error(`Error al eliminar foto anterior de Cloudinary: ${deleteError.message}`);
          }
        }

        const filePhoto = req.files.photo[0];
        const extension = filePhoto.path.split('.').pop();
        const filename = filePhoto.filename;
        const relativePath = filename.includes('sucursales/')
          ? filename.substring(filename.indexOf('sucursales/'))
          : filename;

        updateData.photo = relativePath.endsWith(`.${extension}`) ? relativePath : `${relativePath}.${extension}`;
      }

      // 2. Reemplazo de FLAT (Plano)
      if (req.files.flat) {
        if (currentSucursal.flat && currentSucursal.flat !== 'sucursales/plato_kinaliani_nyvxo5.png') {
          const flatPath = currentSucursal.flat;
          const flatWithoutExt = flatPath.substring(0, flatPath.lastIndexOf('.'));
          const publicId = `Gestion_Restaurantes/${flatWithoutExt}`;

          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (deleteError) {
            console.error(`Error al eliminar plano anterior de Cloudinary: ${deleteError.message}`);
          }
        }

        const fileFlat = req.files.flat[0];
        const extension = fileFlat.path.split('.').pop();
        const filename = fileFlat.filename;
        const relativePath = filename.includes('sucursales/')
          ? filename.substring(filename.indexOf('sucursales/'))
          : filename;

        updateData.flat = relativePath.endsWith(`.${extension}`) ? relativePath : `${relativePath}.${extension}`;
      }
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