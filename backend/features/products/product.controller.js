import Product from './product.model.js';

// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private/Admin
// @desc    Crear un nuevo producto
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, categoria, imagen } = req.body;
        const vendedor = req.usuario.id;

        // Verificamos si ya existe un producto con ese nombre
        const productoExistente = await Product.findOne({ nombre });
        if (productoExistente) {
            return res.status(400).json({ msg: 'Ya existe un producto con este nombre.' });
        }

        const product = new Product({
            nombre,
            descripcion,
            precio,
            stock,
            categoria,
            imagen,
            vendedor
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al crear el producto.', error: error.message });
    }
};

// @desc    Obtener todos los productos (con paginación)
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
    try {
        // 1. Definimos el tamaño de la página
        const pageSize = 8; // Puedes ajustar este número
        
        // 2. Obtenemos parámetros de consulta
        const page = Number(req.query.page) || Number(req.query.pageNumber) || 1;
        const sort = req.query.sort || '';
        const category = req.query.category || '';
        const search = req.query.search || '';

        // 3. Construir el query de filtrado
        let query = {};
        
        if (category) {
            query.categoria = category;
        }
        
        if (search) {
            query.$or = [
                { nombre: { $regex: search, $options: 'i' } },
                { descripcion: { $regex: search, $options: 'i' } }
            ];
        }

        // 4. Contar el total de productos que coinciden con el filtro
        const count = await Product.countDocuments(query);

        // 5. Construir el ordenamiento
        let sortOption = {};
        if (sort) {
            const [field, order] = sort.split('_');
            if (field === 'precio') {
                sortOption.precio = order === 'desc' ? -1 : 1;
            } else if (field === 'nombre') {
                sortOption.nombre = order === 'desc' ? -1 : 1;
            } else if (field === 'createdAt') {
                sortOption.createdAt = order === 'desc' ? -1 : 1;
            }
        } else {
            sortOption.createdAt = -1; // Por defecto, más nuevos primero
        }
        
        // 6. Buscar los productos con filtros y ordenamiento
        const products = await Product.find(query)
            .sort(sortOption)
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        // 7. Devolvemos los productos, la página actual y el número total de páginas
        res.json({
            products,
            page,
            totalPages: Math.ceil(count / pageSize)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener los productos.', error: error.message });
    }
};

// @desc    Obtener todas las categorías únicas de productos
// @route   GET /api/products/categories
// @access  Public
export const getAllCategories = async (req, res) => {
    try {
        // Obtener todas las categorías únicas de los productos
        const categories = await Product.distinct('categoria');
        
        // Filtrar valores null/undefined y ordenar
        const filteredCategories = categories.filter(cat => cat && cat.trim() !== '').sort();
        
        res.json(filteredCategories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al obtener las categorías.', error: error.message });
    }
};

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ msg: 'Producto no encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener el producto.' });
    }
};

// @desc    Actualizar un producto
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, categoria, imagen } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.nombre = nombre || product.nombre;
            product.descripcion = descripcion || product.descripcion;
            product.precio = precio || product.precio;
            product.stock = stock !== undefined ? stock : product.stock;
            product.categoria = categoria || product.categoria;
            product.imagen = imagen || product.imagen;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ msg: 'Producto no encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar el producto.' });
    }
};

// @desc    Eliminar un producto
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (product) {
            res.json({ msg: 'Producto eliminado exitosamente.' });
        } else {
            res.status(404).json({ msg: 'Producto no encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar el producto.' });
    }
};
