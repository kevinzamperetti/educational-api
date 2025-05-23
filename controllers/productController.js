const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Cadastrar um novo produto
// @route   POST /api/products
// @access  Public
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, quantity, category } = req.body;

        // Validação básica de campos obrigatórios
        if (!name || !description || !price || !quantity || !category) {
            return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios: nome, descrição, preço, quantidade e categoria.' });
        }

        // Validação: Verificar se a categoria existe
        const existingCategory = await Category.findById(category);
        if (!existingCategory) {
            return res.status(404).json({ message: 'Categoria não encontrada. Por favor, forneça um ID de categoria válido.' });
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
        console.error('Erro ao cadastrar produto:', error);
        // Erros de validação do Mongoose (ex: min, max)
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao cadastrar produto', error: error.message });
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
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar produtos', error: error.message });
    }
};

// @desc    Buscar produto por ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');

        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error('Erro ao buscar produto por ID:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Formato de ID de produto inválido.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao buscar produto', error: error.message });
    }
};

// @desc    Atualizar produto por ID
// @route   PUT /api/products/:id
// @access  Public
exports.updateProduct = async (req, res) => {
    try {
        const { category } = req.body;

        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado para atualização.' });
        }

        // Validação: Se a categoria for fornecida, verificar se ela existe
        if (category) {
            const existingCategory = await Category.findById(category);
            if (!existingCategory) {
                return res.status(404).json({ message: 'Categoria não encontrada. Por favor, forneça um ID de categoria válido.' });
            }
        }

        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Retorna o documento atualizado
            runValidators: true, // Executa as validações do schema
        }).populate('category', 'name');

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Formato de ID de produto inválido.' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar produto', error: error.message });
    }
};

// @desc    Excluir produto por ID
// @route   DELETE /api/products/:id
// @access  Public
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado para exclusão.' });
        }

        await product.deleteOne(); // Usar deleteOne() para remover o documento

        res.status(200).json({ success: true, message: 'Produto removido com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Formato de ID de produto inválido.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao excluir produto', error: error.message });
    }
};

// @desc    Listar produtos por categoria
// @route   GET /api/products/category/:categoryId
// @access  Public
exports.getProductsByCategory = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.categoryId)) {
            return res.status(400).json({ message: 'Formato de ID de categoria inválido.' });
        }

        const products = await Product.find({ category: req.params.categoryId }).populate('category', 'name');

        if (products.length === 0) {
            // Poderia também verificar se a categoria existe para diferenciar "categoria vazia" de "categoria inexistente"
            const existingCategory = await Category.findById(req.params.categoryId);
            if (!existingCategory) {
                return res.status(404).json({ message: 'Categoria não encontrada.' });
            }
            return res.status(200).json({ success: true, count: 0, data: [], message: 'Nenhum produto encontrado para esta categoria.' });
        }

        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error) {
        console.error('Erro ao buscar produtos por categoria:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar produtos por categoria', error: error.message });
    }
};