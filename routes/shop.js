const express = require('express');
const { body } = require('express-validator')

const shopRoutes = require('../controllers/shop');
const router = express.Router();

//router.get('/product', shopRoutes.createNewProduct);

//router.get('/products', shopRoutes.getProducts);
module.exports = router;