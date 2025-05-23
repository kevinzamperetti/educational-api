const Product = require('../models/Product');

// @desc    Cadastrar um novo produto
// @route   POST /api/products
// @access  Public
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, quantity, category } = req.body;

        // Validação básica
        if (!name || !description || !price || !quantity || !category) {
            return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios.' });
        }

        const product = await Product.create({
            name,
            description,
            price,
            quantity,
            category,
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar produto', error: error.message });
    }
};

// @desc    Listar todos os produtos
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category', 'name'); // Popula o nome da categoria
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
    }
};

// @desc    Buscar produto por ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');

        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar produto', error: error.message });
    }
};

// @desc    Atualizar produto por ID
// @route   PUT /api/products/:id
// @access  Public
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, quantity, category } = req.body;

        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Retorna o documento atualizado
            runValidators: true, // Executa as validações do schema
        }).populate('category', 'name');

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar produto', error: error.message });
    }
};

// @desc    Excluir produto por ID
// @route   DELETE /api/products/:id
// @access  Public
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        await product.deleteOne(); // Usar deleteOne() para remover o documento

        res.status(200).json({ success: true, message: 'Produto removido com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao excluir produto', error: error.message });
    }
};

// @desc    Listar produtos por categoria
// @route   GET /api/products/category/:categoryId
// @access  Public
exports.getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.categoryId }).populate('category', 'name');

        if (products.length === 0) {
            return res.status(404).json({ message: 'Nenhum produto encontrado para esta categoria' });
        }

        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar produtos por categoria', error: error.message });
    }
};