require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const express = require('express');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes'); // Nova rota de usuário
const orderRoutes = require('./routes/orderRoutes'); // Nova rota de pedido
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();

// Conecta ao banco de dados
connectDB();

// Middleware para parsear JSON
app.use(express.json());

// Carrega o arquivo swagger.yaml
const swaggerDocument = YAML.load(path.join(__dirname, './swagger/swagger.yaml'));

// Rota para a documentação Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota para download do swagger.yaml
app.get('/swagger.yaml', (req, res) => {
    res.sendFile(path.join(__dirname, './swagger/swagger.yaml'));
});

// Rotas da API
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes); // Usa as rotas de usuário
app.use('/api/orders', orderRoutes); // Usa as rotas de pedido

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));