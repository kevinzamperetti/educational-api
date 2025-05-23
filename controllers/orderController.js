const Order = require('../models/Order');
const Product = require('../models/Product'); // Para verificar o estoque
const User = require('../models/User'); // Para verificar o usuário

// @desc    Cadastrar um novo pedido
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res) => {
    try {
        const { user, products, totalAmount } = req.body;

        if (!user || !products || products.length === 0 || totalAmount === undefined || totalAmount === null) {
            return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios: usuário, produtos e valor total, e adicione pelo menos um produto.' });
        }

        // Validação: Verificar se o usuário existe (e tratar CastError como 404)
        const existingUser = await User.findById(user);
        if (!existingUser) {
            return res.status(404).json({ message: 'Usuário não encontrado. Por favor, forneça um ID de usuário válido e existente.' });
        }

        // Validação: Verificar e atualizar o estoque dos produtos
        let productsWithDetails = [];
        for (const item of products) {
            if (!item.product || !item.quantity || item.quantity <= 0) {
                return res.status(400).json({ message: 'Cada item do produto deve ter um ID de produto válido e uma quantidade positiva.' });
            }

            const product = await Product.findById(item.product);
            if (!product) {
                // Tratar CastError para IDs de produto inválidos no array como 404
                return res.status(404).json({ message: `Produto com ID '${item.product}' não encontrado.` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({ message: `Estoque insuficiente para o produto: '${product.name}'. Disponível: ${product.quantity}, Solicitado: ${item.quantity}.` });
            }
            // Atualiza a quantidade do produto no estoque
            product.quantity -= item.quantity;
            await product.save();
            productsWithDetails.push({ product: product._id, quantity: item.quantity });
        }

        // Criar o pedido com os produtos e quantidades validadas
        const order = await Order.create({ user, products: productsWithDetails, totalAmount });
        res.status(201).json({ success: true, data: order });
    } catch (error) {
        console.error('Erro ao cadastrar pedido:', error);
        // Tratar CastError para IDs inválidos (do usuário ou produtos no array) como 404
        if (error.name === 'CastError') {
            const message = error.path === 'user' ? 'Usuário não encontrado. Por favor, forneça um ID de usuário válido e existente.' : `Produto com ID '${error.value}' não encontrado.`;
            return res.status(404).json({ message: message });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao cadastrar pedido', error: error.message });
    }
};

// @desc    Listar todos os pedidos
// @route   GET /api/orders
// @access  Public
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('products.product', 'name price'); // Popula detalhes do usuário e do produto
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar pedidos', error: error.message });
    }
};

// @desc    Buscar pedido por ID
// @route   GET /api/orders/:id
// @access  Public
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('products.product', 'name price');

        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado.' });
        }
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error('Erro ao buscar pedido por ID:', error);
        // Se o ID não for um ObjectId válido do Mongoose, tratar como não encontrado (404)
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Pedido não encontrado.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao buscar pedido', error: error.message });
    }
};

// @desc    Atualizar status do pedido por ID
// @route   PUT /api/orders/:id/status
// @access  Public
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Por favor, forneça um status para atualização.' });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado para atualização de status.' });
        }

        // Validação do status (deve ser um dos valores permitidos no enum do schema)
        const allowedStatuses = ['Pendente', 'Processando', 'Enviado', 'Entregue', 'Cancelado'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: `Status inválido. Use um dos seguintes: ${allowedStatuses.join(', ')}.` });
        }

        order.status = status;
        await order.save();

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error);
        // Se o ID não for um ObjectId válido do Mongoose, tratar como não encontrado (404)
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Pedido não encontrado para atualização de status.' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar status do pedido', error: error.message });
    }
};

// @desc    Excluir pedido por ID
// @route   DELETE /api/orders/:id
// @access  Public
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado para exclusão.' });
        }

        // Opcional: Reverter estoque dos produtos ao excluir o pedido
        // É importante decidir a lógica de negócio aqui:
        // - Se o pedido foi cancelado antes do envio, reverter o estoque faz sentido.
        // - Se o pedido já foi enviado/entregue, talvez não faça sentido reverter o estoque.
        // Por simplicidade, estamos revertendo aqui.
        for (const item of order.products) {
            const product = await Product.findById(item.product);
            if (product) {
                product.quantity += item.quantity;
                await product.save();
            }
        }

        await order.deleteOne();
        res.status(200).json({ success: true, message: 'Pedido removido com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir pedido:', error);
        // Se o ID não for um ObjectId válido do Mongoose, tratar como não encontrado (404)
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Pedido não encontrado para exclusão.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao excluir pedido', error: error.message });
    }
};

// @desc    Listar pedidos por usuário
// @route   GET /api/orders/user/:userId
// @access  Public
exports.getOrdersByUser = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId })
            .populate('user', 'name email')
            .populate('products.product', 'name price');

        // Verificar se o usuário existe para diferenciar "usuário sem pedidos" de "usuário inexistente"
        const existingUser = await User.findById(req.params.userId);
        if (!existingUser) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        if (orders.length === 0) {
            return res.status(200).json({ success: true, count: 0, data: [], message: 'Nenhum pedido encontrado para este usuário.' });
        }

        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        console.error('Erro ao buscar pedidos por usuário:', error);
        // Se o ID do usuário não for um ObjectId válido do Mongoose, tratar como não encontrado (404)
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao buscar pedidos por usuário', error: error.message });
    }
};