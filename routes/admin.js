const path = require('path');

const express = require('express');

const adminRoutes = require('../controllers/admin');
const isAuth = require('../middleware/auth');
const router = express.Router();

//router.get('/add-product', adminController.getAddProduct);
router.get('/products',
    adminRoutes.getProducts
    );

router.post('/add-product', 
    isAuth, 
    adminRoutes.postAddProduct
    );

router.get('/edit-product/:productId', 
    isAuth,
    adminRoutes.getEditProduct
    );

router.put('/edit-product/:productId', 
    isAuth,
    adminRoutes.postEditProduct
    );

router.delete('/delete-product/:productId', 
    isAuth,
    adminRoutes.postDeleteProduct
    );


module.exports = router;