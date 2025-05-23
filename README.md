# API Educacional 🛍️

Esta API foi desenvolvida para fins educacionais, simulando um sistema de e-commerce básico. Ela permite o gerenciamento de produtos, categorias, usuários e pedidos. 🚀

## Funcionalidades Principais:

* **Produtos:** Cadastro, listagem, busca por ID, atualização e exclusão de produtos. 📦
* **Categorias:** Cadastro, listagem, busca por ID, atualização e exclusão de categorias. 🏷️
* **Usuários:** Cadastro, listagem, busca por ID e exclusão de usuários. 👤
* **Pedidos:** Criação de pedidos (com verificação de estoque), listagem, busca por ID, atualização de status e exclusão de pedidos. 🛒

## Regras de Negócio e Tratamento de Erros:

* **Validação de Campos:** Todas as requisições `POST` e `PUT` validam a presença e o formato dos campos obrigatórios. Campos como 'name' (para categorias) e 'email' (para usuários) devem ser únicos. ✅
* **Validação de IDs:**
    * Ao criar/atualizar um produto, a 'category' fornecida deve corresponder a uma categoria existente.
    * Ao criar um pedido, o 'user' e os 'products' referenciados devem existir.
    * Requisições que utilizam IDs no caminho (path parameters) ou no corpo da requisição:
        * Se o ID for inválido (formato incorreto) ou não for encontrado no banco de dados, a API retornará um status `404 Not Found` com uma mensagem clara de que o recurso não foi encontrado. Isso unifica o tratamento de erros para IDs. 🚫🆔
* **Estoque:** A criação de pedidos verifica a disponibilidade de estoque dos produtos. Se o estoque for insuficiente, a requisição retornará `400 Bad Request`. 📉
* **Status de Pedido:** A atualização do status de um pedido aceita apenas valores predefinidos (Pendente, Processando, Enviado, Entregue, Cancelado). 🔄
* **Códigos de Status HTTP:**
    * `200 OK`: Requisição bem-sucedida. 👍
    * `201 Created`: Recurso criado com sucesso. ✨
    * `400 Bad Request`: Dados da requisição inválidos (validação falhou, campos faltando, etc.). ❌
    * `404 Not Found`: Recurso não encontrado (ID inválido ou inexistente). 🔍
    * `500 Internal Server Error`: Erro inesperado no servidor. 💥