const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Por favor, adicione um nome para a categoria'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Por favor, adicione uma descrição para a categoria'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Category', CategorySchema);