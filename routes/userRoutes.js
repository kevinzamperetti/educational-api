const express = require('express');
const {
    createUser,
    getUsers,
    getUserById,
    deleteUser,
} = require('../controllers/userController');

const router = express.Router();

router.route('/').post(createUser).get(getUsers);
router.route('/:id').get(getUserById).delete(deleteUser);

module.exports = router;