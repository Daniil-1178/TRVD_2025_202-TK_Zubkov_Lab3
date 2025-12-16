const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const isAuth = require('../middleware/isAuth');
const checkRole = require('../middleware/checkRole');

router.get('/register', userController.redirectIfLoggedIn, userController.getRegister);
router.post('/register', userController.postRegister);

router.get('/login', userController.redirectIfLoggedIn, userController.getLogin);
router.post('/login', userController.postLogin);

router.post('/logout', userController.postLogout);

router.get('/users', isAuth, checkRole('admin'), userController.getUsers);

module.exports = router;
