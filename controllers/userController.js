const User = require('../models/User');

// @desc    Cadastrar um novo usuário
// @route   POST /api/users
// @access  Public
exports.createUser = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios.' });
        }

        const user = await User.create({ name, email });
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao cadastrar usuário', error: error.message });
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
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
    }
};

// @desc    Buscar usuário por ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar usuário', error: error.message });
    }
};

// @desc    Excluir usuário por ID
// @route   DELETE /api/users/:id
// @access  Public
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        await user.deleteOne();
        res.status(200).json({ success: true, message: 'Usuário removido com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao excluir usuário', error: error.message });
    }
};