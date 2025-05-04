const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware, checkRole } = require('../middleware/auth.middleware');

// Routes protégées
router.get('/', authMiddleware, checkRole(['ADMIN']), userController.getAllUsers);
router.get('/:id', authMiddleware, checkRole(['ADMIN']), userController.getUserById);
router.put('/:id', authMiddleware, checkRole(['ADMIN']), userController.updateUser);
router.delete('/:id', authMiddleware, checkRole(['ADMIN']), userController.deleteUser);

module.exports = router; 