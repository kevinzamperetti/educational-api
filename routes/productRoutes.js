const express = require('express');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
} = require('../controllers/productController');

const router = express.Router();

router.route('/').post(createProduct).get(getProducts);
router.route('/:id').get(getProductById).put(updateProduct).delete(deleteProduct);
router.route('/category/:categoryId').get(getProductsByCategory); // Nova rota para buscar produtos por categoria

module.exports = router;