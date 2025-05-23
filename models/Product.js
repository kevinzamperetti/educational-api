const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Por favor, adicione um nome para o produto'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Por favor, adicione uma descrição para o produto'],
    },
    price: {
        type: Number,
        required: [true, 'Por favor, adicione um preço para o produto'],
        min: [0, 'O preço não pode ser negativo'],
    },
    quantity: {
        type: Number,
        required: [true, 'Por favor, adicione a quantidade em estoque'],
        min: [0, 'A quantidade não pode ser negativa'],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // Referencia o modelo Category
        required: [true, 'Por favor, adicione uma categoria para o produto'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Product', ProductSchema);