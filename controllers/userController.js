const User = require('../models/User');

// @desc    Cadastrar um novo usuário
// @route   POST /api/users
// @access  Public
exports.createUser = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios: nome e email.' });
        }

        const user = await User.create({ name, email });
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: `O usuário com o email '${req.body.email}' já existe.` });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao cadastrar usuário', error: error.message });
    }
};

// @desc    Listar todos os usuários
// @route   GET /api/users
// @access  Public
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar usuários', error: error.message });
    }
};

// @desc    Buscar usuário por ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('Erro ao buscar usuário por ID:', error);
        // Se o ID não for um ObjectId válido do Mongoose, tratar como não encontrado (404)
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao buscar usuário', error: error.message });
    }
};

// @desc    Excluir usuário por ID
// @route   DELETE /api/users/:id
// @access  Public
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado para exclusão.' });
        }
        await user.deleteOne();
        res.status(200).json({ success: true, message: 'Usuário removido com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        // Se o ID não for um ObjectId válido do Mongoose, tratar como não encontrado (404)
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Usuário não encontrado para exclusão.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao excluir usuário', error: error.message });
    }
};