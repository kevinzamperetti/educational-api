const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Por favor, adicione o ID do usuário'],
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: [true, 'Por favor, adicione o ID do produto'],
            },
            quantity: {
                type: Number,
                required: [true, 'Por favor, adicione a quantidade do produto'],
                min: [1, 'A quantidade deve ser pelo menos 1'],
            },
        },
    ],
    totalAmount: {
        type: Number,
        required: [true, 'Por favor, adicione o valor total do pedido'],
        min: [0, 'O valor total não pode ser negativo'],
    },
    status: {
        type: String,
        enum: ['Pendente', 'Processando', 'Enviado', 'Entregue', 'Cancelado'],
        default: 'Pendente',
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Order', OrderSchema);