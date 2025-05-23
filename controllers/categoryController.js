const Category = require('../models/Category');
const mongoose = require('mongoose');

// @desc    Cadastrar uma nova categoria
// @route   POST /api/categories
// @access  Public
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validação básica
        if (!name || !description) {
            return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios: nome e descrição.' });
        }

        const category = await Category.create({
            name,
            description,
        });

        res.status(201).json({ success: true, data: category });
    } catch (error) {
        console.error('Erro ao cadastrar categoria:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: `A categoria com o nome '${req.body.name}' já existe.` });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao cadastrar categoria', error: error.message });
    }
};

// @desc    Listar todas as categorias
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar categorias', error: error.message });
    }
};

// @desc    Buscar categoria por ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Categoria não encontrada.' });
        }

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.error('Erro ao buscar categoria por ID:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Formato de ID de categoria inválido.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao buscar categoria', error: error.message });
    }
};

// @desc    Atualizar categoria por ID
// @route   PUT /api/categories/:id
// @access  Public
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        let category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Categoria não encontrada para atualização.' });
        }

        category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Retorna o documento atualizado
            runValidators: true, // Executa as validações do schema
        });

        res.status(200).json({ success: true, data: category });
    } catch (error) {
        console.error('Erro ao atualizar categoria:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Formato de ID de categoria inválido.' });
        }
        if (error.code === 11000) {
            return res.status(400).json({ message: `A categoria com o nome '${req.body.name}' já existe.` });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar categoria', error: error.message });
    }
};

// @desc    Excluir categoria por ID
// @route   DELETE /api/categories/:id
// @access  Public
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Categoria não encontrada para exclusão.' });
        }

        await category.deleteOne();

        res.status(200).json({ success: true, message: 'Categoria removida com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Formato de ID de categoria inválido.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao excluir categoria', error: error.message });
    }
};