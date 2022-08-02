const path = require('path');

const express = require('express');

const userRoutes = require('../controllers/user');
const router = express.Router();

const {body} = require('express-validator');

//router.get('/add-product', adminController.getAddProduct);
router.post('/register',
    body('username').not().isEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 8}),
userRoutes.signup);

router.post('/login',
    body('email').isEmail(),
    body('password').isLength({ min: 8}),
userRoutes.login);

module.exports = router;