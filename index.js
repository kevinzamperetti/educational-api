require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

const app = express();

connectDB();

// Middleware para parsear JSON
app.use(express.json());

// Habilita o CORS (mantenha sua configuração de CORS aqui)
// Permitir todas as origens (bom para desenvolvimento, mas cuidado em produção)
app.use(cors());

// Permitir apenas origens específicas (mais seguro para produção)
/*
app.use(cors({
    origin: 'https://seu-frontend.com', // Substitua pela URL do seu frontend em produção
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
*/

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

// Definição do documento Swagger/OpenAPI como um objeto JavaScript
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'API Educacional',
        description: `
        Uma API simples para cadastro e gerenciamento de produtos, categorias, usuários e pedidos, desenvolvida para fins educacionais.

        Ela permite o gerenciamento de produtos, categorias, usuários e pedidos.

        Funcionalidades Principais:
        - Produtos: Cadastro, listagem, busca por ID, atualização e exclusão de produtos.
        - Categorias: Cadastro, listagem, busca por ID, atualização e exclusão de categorias.
        - Usuários: Cadastro, listagem, busca por ID e exclusão de usuários.
        - Pedidos: Criação de pedidos (com verificação de estoque), listagem, busca por ID, atualização de status e exclusão de pedidos.

        Regras de Negócio e Tratamento de Erros:
        - Validação de Campos: Todas as requisições POST e PUT validam a presença e o formato dos campos obrigatórios. Campos como 'name' (para categorias) e 'email' (para usuários) devem ser únicos.
        - Validação de IDs:
            - Ao criar/atualizar um produto, a 'category' fornecida deve corresponder a uma categoria existente.
            - Ao criar um pedido, o 'user' e os 'products' referenciados devem existir.
            - Requisições que utilizam IDs no caminho (path parameters) ou no corpo da requisição:
                - Se o ID for inválido (formato incorreto) ou não for encontrado no banco de dados, a API retornará um status \`404 Not Found\` com uma mensagem clara de que o recurso não foi encontrado. Isso unifica o tratamento de erros para IDs.
        - Estoque: A criação de pedidos verifica a disponibilidade de estoque dos produtos. Se o estoque for insuficiente, a requisição retornará \`400 Bad Request\`.
        - Status de Pedido: A atualização do status de um pedido aceita apenas valores predefinidos (Pendente, Processando, Enviado, Entregue, Cancelado).
        - Códigos de Status HTTP:
            - \`200 OK\`: Requisição bem-sucedida.
            - \`201 Created\`: Recurso criado com sucesso.
            - \`400 Bad Request\`: Dados da requisição inválidos (validação falhou, campos faltando, etc.).
            - \`404 Not Found\`: Recurso não encontrado (ID inválido ou inexistente).
            - \`500 Internal Server Error\`: Erro inesperado no servidor.
        `,
        version: '1.0.0',
    },
    servers: [
        {
            url: API_BASE_URL,
            description: 'Servidor da API',
        },
    ],
    tags: [
        { name: 'Produtos', description: 'Operações relacionadas a produtos' },
        { name: 'Categorias', description: 'Operações relacionadas a categorias' },
        { name: 'Usuários', description: 'Operações relacionadas a usuários' },
        { name: 'Pedidos', description: 'Operações relacionadas a pedidos' },
    ],
    paths: {
        '/products': {
            post: {
                summary: 'Cadastra um novo produto',
                tags: ['Produtos'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ProductInput'
                            }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Produto cadastrado com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Product' }
                            }
                        }
                    },
                    '400': { description: 'Requisição inválida (campos faltando ou inválidos)' },
                    '404': { description: 'Categoria não encontrada (ID inválido ou inexistente)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            get: {
                summary: 'Lista todos os produtos',
                tags: ['Produtos'],
                responses: {
                    '200': {
                        description: 'Lista de produtos retornada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        count: { type: 'integer' },
                                        data: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
                                    }
                                }
                            }
                        }
                    },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/products/{id}': {
            get: {
                summary: 'Busca um produto por ID',
                tags: ['Produtos'],
                parameters: [
                    { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID do produto' }
                ],
                responses: {
                    '200': {
                        description: 'Produto encontrado com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Product' }
                            }
                        }
                    },
                    '404': { description: 'Produto não encontrado (ID inválido ou inexistente)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            put: {
                summary: 'Atualiza um produto por ID',
                tags: ['Produtos'],
                parameters: [
                    { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID do produto a ser atualizado' }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ProductInput' }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Produto atualizado com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Product' }
                            }
                        }
                    },
                    '400': { description: 'Requisição inválida (campos faltando ou inválidos)' },
                    '404': { description: 'Produto ou Categoria não encontrado (ID inválido ou inexistente)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            delete: {
                summary: 'Exclui um produto por ID',
                tags: ['Produtos'],
                parameters: [
                    { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID do produto a ser excluído' }
                ],
                responses: {
                    '200': {
                        description: 'Produto excluído com sucesso',
                        content: {
                            'application/json': {
                                schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } }
                            }
                        }
                    },
                    '404': { description: 'Produto não encontrado (ID inválido ou inexistente)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/products/category/{categoryId}': {
            get: {
                summary: 'Lista produtos por ID de categoria',
                tags: ['Produtos'],
                parameters: [
                    { in: 'path', name: 'categoryId', schema: { type: 'string' }, required: true, description: 'ID da categoria para filtrar produtos' }
                ],
                responses: {
                    '200': {
                        description: 'Produtos da categoria retornados com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        count: { type: 'integer' },
                                        data: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
                                    }
                                }
                            }
                        }
                    },
                    '404': { description: 'Categoria não encontrada (ID inválido ou inexistente) ou nenhum produto encontrado para esta categoria' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/categories': {
            post: {
                summary: 'Cadastra uma nova categoria',
                tags: ['Categorias'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CategoryInput' }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Categoria cadastrada com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Category' }
                            }
                        }
                    },
                    '400': { description: 'Requisição inválida (campos faltando, inválidos ou nome duplicado)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            get: {
                summary: 'Lista todas as categorias',
                tags: ['Categorias'],
                responses: {
                    '200': {
                        description: 'Lista de categorias retornada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        count: { type: 'integer' },
                                        data: { type: 'array', items: { $ref: '#/components/schemas/Category' } }
                                    }
                                }
                            }
                        }
                    },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/categories/{id}': {
            get: {
                summary: 'Busca uma categoria por ID',
                tags: ['Categorias'],
                parameters: [
                    { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID da categoria' }
                ],
                responses: {
                    '200': {
                        description: 'Categoria encontrada com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Category' }
                            }
                        }
                    },
                    '404': { description: 'Categoria não encontrada (ID inválido ou inexistente)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            put: {
                summary: 'Atualiza uma categoria por ID',
                tags: ['Categorias'],
                parameters: [
                    { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID da categoria a ser atualizada' }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/CategoryInput' }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Categoria atualizada com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Category' }
                            }
                        }
                    },
                    '400': { description: 'Requisição inválida (campos faltando, inválidos ou nome duplicado)' },
                    '404': { description: 'Categoria não encontrada (ID inválido ou inexistente)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            delete: {
                summary: 'Exclui uma categoria por ID',
                tags: ['Categorias'],
                parameters: [
                    { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID da categoria a ser excluída' }
                ],
                responses: {
                    '200': {
                        description: 'Categoria excluída com sucesso',
                        content: {
                            'application/json': {
                                schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } }
                            }
                        }
                    },
                    '404': { description: 'Categoria não encontrada (ID inválido ou inexistente)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/users': {
            post: {
                summary: 'Cadastra um novo usuário',
                tags: ['Usuários'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UserInput' }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Usuário cadastrado com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/User' }
                            }
                        }
                    },
                    '400': { description: 'Requisição inválida (campos faltando, inválidos ou email duplicado)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            get: {
                summary: 'Lista todos os usuários',
                tags: ['Usuários'],
                responses: {
                    '200': {
                        description: 'Lista de usuários retornada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        count: { type: 'integer' },
                                        data: { type: 'array', items: { $ref: '#/components/schemas/User' } }
                                    }
                                }
                            }
                        }
                    },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/users/{id}': {
            get: {
                summary: 'Busca um usuário por ID',
                tags: ['Usuários'],
                parameters: [
                    { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID do usuário' }
                ],
                responses: {
                    '200': {
                        description: 'Usuário encontrado com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/User' }
                            }
                        }
                    },
                    '404': { description: 'Usuário não encontrado (ID inválido ou inexistente)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            delete: {
                summary: 'Exclui um usuário por ID',
                tags: ['Usuários'],
                parameters: [
                    { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID do usuário a ser excluído' }
                ],
                responses: {
                    '200': {
                        description: 'Usuário excluído com sucesso',
                        content: {
                            'application/json': {
                                schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } }
                            }
                        }
                    },
                    '404': { description: 'Usuário não encontrado (ID inválido ou inexistente)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/orders': {
            post: {
                summary: 'Cadastra um novo pedido',
                tags: ['Pedidos'],
                requestBody: {
                    required: ['user', 'products'],
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/OrderInput' }
                        }
                    }
                },
                responses: {
                    '201': {
                        description: 'Pedido cadastrado com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Order' }
                            }
                        }
                    },
                    '400': { description: 'Requisição inválida (campos faltando, inválidos ou estoque insuficiente)' },
                    '404': { description: 'Usuário ou Produto(s) não encontrado(s) (ID inválido ou inexistente)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            get: {
                summary: 'Lista todos os pedidos',
                tags: ['Pedidos'],
                responses: {
                    '200': {
                        description: 'Lista de pedidos retornada com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        count: { type: 'integer' },
                                        data: { type: 'array', items: { $ref: '#/components/schemas/Order' } }
                                    }
                                }
                            }
                        }
                    },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/orders/{id}': {
            get: {
                summary: 'Busca um pedido por ID',
                tags: ['Pedidos'],
                parameters: [
                    { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID do pedido' }
                ],
                responses: {
                    '200': {
                        description: 'Pedido encontrado com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Order' }
                            }
                        }
                    },
                    '404': { description: 'Pedido não encontrado (ID inválido ou inexistente)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            },
            delete: {
                summary: 'Exclui um pedido por ID',
                tags: ['Pedidos'],
                parameters: [
                    { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID do pedido a ser excluído' }
                ],
                responses: {
                    '200': {
                        description: 'Pedido excluído com sucesso',
                        content: {
                            'application/json': {
                                schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } }
                            }
                        }
                    },
                    '404': { description: 'Pedido não encontrado (ID inválido ou inexistente)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/orders/{id}/status': {
            put: {
                summary: 'Atualiza o status de um pedido por ID',
                tags: ['Pedidos'],
                parameters: [
                    { in: 'path', name: 'id', schema: { type: 'string' }, required: true, description: 'ID do pedido a ser atualizado' }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/OrderStatusUpdate' }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Status do pedido atualizado com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Order' }
                            }
                        }
                    },
                    '400': { description: 'Requisição inválida (status inválido)' },
                    '404': { description: 'Pedido não encontrado (ID inválido ou inexistente)' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        },
        '/orders/user/{userId}': {
            get: {
                summary: 'Lista todos os pedidos de um usuário específico',
                tags: ['Pedidos'],
                parameters: [
                    { in: 'path', name: 'userId', schema: { type: 'string' }, required: true, description: 'ID do usuário para filtrar pedidos' }
                ],
                responses: {
                    '200': {
                        description: 'Pedidos do usuário retornados com sucesso',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        count: { type: 'integer' },
                                        data: { type: 'array', items: { $ref: '#/components/schemas/Order' } }
                                    }
                                }
                            }
                        }
                    },
                    '404': { description: 'Usuário não encontrado (ID inválido ou inexistente) ou nenhum pedido encontrado para este usuário' },
                    '500': { description: 'Erro interno do servidor' }
                }
            }
        }
    },
    components: {
        schemas: {
            ProductInput: {
                type: 'object',
                required: ['name', 'description', 'price', 'quantity', 'category'],
                properties: {
                    name: { type: 'string', description: 'Nome do produto', example: 'Smartphone X' },
                    description: { type: 'string', description: 'Descrição detalhada do produto', example: 'Smartphone de última geração com câmera de alta resolução.' },
                    price: { type: 'number', format: 'float', description: 'Preço do produto', example: 999.99 },
                    quantity: { type: 'integer', description: 'Quantidade em estoque', example: 50 },
                    category: { type: 'string', description: 'ID da categoria à qual o produto pertence', example: '60d5ec49f8c6d1a2b4e5f6g7' }
                }
            },
            Product: {
                type: 'object',
                properties: {
                    _id: { type: 'string', description: 'ID único do produto', example: '60d5ec49f8c6d1a2b4e5f6g7' },
                    name: { type: 'string', description: 'Nome do produto', example: 'Smartphone X' },
                    description: { type: 'string', description: 'Descrição detalhada do produto', example: 'Smartphone de última geração com câmera de alta resolução.' },
                    price: { type: 'number', format: 'float', description: 'Preço do produto', example: 999.99 },
                    quantity: { type: 'integer', description: 'Quantidade em estoque', example: 50 },
                    category: {
                        type: 'object',
                        properties: {
                            _id: { type: 'string', example: '60d5ec49f8c6d1a2b4e5f6g7' },
                            name: { type: 'string', example: 'Eletrônicos' }
                        },
                        description: 'Categoria à qual o produto pertence (populada)'
                    },
                    createdAt: { type: 'string', format: 'date-time', description: 'Data de criação do produto', example: '2023-10-27T10:00:00.000Z' }
                }
            },
            CategoryInput: {
                type: 'object',
                required: ['name', 'description'],
                properties: {
                    name: { type: 'string', description: 'Nome da categoria', example: 'Eletrônicos' },
                    description: { type: 'string', description: 'Descrição da categoria', example: 'Produtos eletrônicos como smartphones, laptops, etc.' }
                }
            },
            Category: {
                type: 'object',
                properties: {
                    _id: { type: 'string', description: 'ID único da categoria', example: '60d5ec49f8c6d1a2b4e5f6g7' },
                    name: { type: 'string', description: 'Nome da categoria', example: 'Eletrônicos' },
                    description: { type: 'string', description: 'Descrição da categoria', example: 'Produtos eletrônicos como smartphones, laptops, etc.' },
                    createdAt: { type: 'string', format: 'date-time', description: 'Data de criação da categoria', example: '2023-10-27T10:00:00.000Z' }
                }
            },
            UserInput: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                    name: { type: 'string', description: 'Nome do usuário', example: 'João Silva' },
                    email: { type: 'string', format: 'email', description: 'Endereço de email do usuário (deve ser único)', example: 'joao.silva@example.com' }
                }
            },
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string', description: 'ID único do usuário', example: '60d5ec49f8c6d1a2b4e5f6g7' },
                    name: { type: 'string', description: 'Nome do usuário', example: 'João Silva' },
                    email: { type: 'string', format: 'email', description: 'Endereço de email do usuário', example: 'joao.silva@example.com' },
                    createdAt: { type: 'string', format: 'date-time', description: 'Data de criação do usuário', example: '2023-10-27T10:00:00.000Z' }
                }
            },
            OrderProduct: {
                type: 'object',
                required: ['product', 'quantity'],
                properties: {
                    product: { type: 'string', description: 'ID do produto', example: '60d5ec49f8c6d1a2b4e5f6g7' },
                    quantity: { type: 'integer', description: 'Quantidade do produto no pedido', example: 2 }
                }
            },
            OrderInput: {
                type: 'object',
                required: ['user', 'products'],
                properties: {
                    user: { type: 'string', description: 'ID do usuário que fez o pedido', example: '60d5ec49f8c6d1a2b4e5f6g7' },
                    products: { type: 'array', items: { $ref: '#/components/schemas/OrderProduct' }, description: 'Lista de produtos e suas quantidades no pedido' },
                    totalAmount: { type: 'number', format: 'float', readOnly: true, description: 'Valor total do pedido (calculado pelo servidor)', example: 1999.98 }
                }
            },
            Order: {
                type: 'object',
                properties: {
                    _id: { type: 'string', description: 'ID único do pedido', example: '60d5ec49f8c6d1a2b4e5f6g7' },
                    user: {
                        type: 'object',
                        properties: {
                            _id: { type: 'string', example: '60d5ec49f8c6d1a2b4e5f6g7' },
                            name: { type: 'string', example: 'João Silva' },
                            email: { type: 'string', example: 'joao.silva@example.com' }
                        },
                        description: 'Usuário que fez o pedido (populado)'
                    },
                    products: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                _id: { type: 'string', example: '60d5ec49f8c6d1a2b4e5f6g7' },
                                product: {
                                    type: 'object',
                                    properties: {
                                        _id: { type: 'string', example: '60d5ec49f8c6d1a2b4e5f6g7' },
                                        name: { type: 'string', example: 'Smartphone X' },
                                        price: { type: 'number', example: 999.99 }
                                    },
                                    description: 'Detalhes do produto (populado)'
                                },
                                quantity: { type: 'integer', example: 2 }
                            }
                        },
                        description: 'Lista de produtos e suas quantidades no pedido'
                    },
                    totalAmount: { type: 'number', format: 'float', description: 'Valor total do pedido', example: 1999.98 },
                    status: { type: 'string', enum: ['Pendente', 'Processando', 'Enviado', 'Entregue', 'Cancelado'], description: 'Status atual do pedido', example: 'Pendente' },
                    orderDate: { type: 'string', format: 'date-time', description: 'Data do pedido', example: '2023-10-27T10:30:00.000Z' }
                }
            },
            OrderStatusUpdate: {
                type: 'object',
                required: ['status'],
                properties: {
                    status: { type: 'string', enum: ['Pendente', 'Processando', 'Enviado', 'Entregue', 'Cancelado'], description: 'Novo status do pedido', example: 'Enviado' }
                }
            }
        }
    }
};

// Rota para a documentação Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rota para download do swagger.json (agora é JSON, não mais YAML estático)
app.get('/swagger.json', (req, res) => {
    res.json(swaggerDocument); // Envia o JSON gerado dinamicamente
});

// Rotas da API
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));