import Producto from '../models/Producto.js';

export const crearProducto = async (req, res) => {
  try {
    const nuevo = new Producto(req.body);
    await nuevo.save();
    res.status(201).json({ mensaje: 'Producto creado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};


export const obtenerProductos = async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};
