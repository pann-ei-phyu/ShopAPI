const mongodb = require('mongodb');

const Product = require('../model/product');
const User = require('../model/user');
const path = require('path');
const fs = require('fs');

exports.postAddProduct= async (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const image = req.file;
  console.log(image);
  let creator;
  if(!image){
    const error = new Error('Inavalid file attach');
    error.statusCode = 422;
    throw error;
  }
  
  const imageUrl = image.path;
  console.log(imageUrl);
  //console.log(req.body);
  const product = new Product ({
      title: title, 
      price: price, 
      description: description, 
      imageUrl: imageUrl,
      creator: req.userId
    });
  try { 
    await product.save();
    const user = await User.findById(req.userId);
    creator= user;
    user.products.push(product);
    await user.save();
    console.log('created product');
    res.status(201).json({ message: 'Product created!', productId: result._id,
    product: product,
    creator: {_id: creator._id, name: creator.name}
    });
    
  }
  catch(err) {
    next(err) ;
  }
};

exports.getEditProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  try {
    const product = await Product.findById(prodId);
    if (!product) {
      const error = new Error('Could not find product.');
      error.statusCode = 404;
      throw error;
      }
    res.status(201).json({ message: 'This is edit product', product: product });
  }
  catch(err) {
    next(err);
  };
};
  

exports.postEditProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error('No file picked.');
    error.statusCode = 422;
    throw error;
  }
  const updatedDesc = req.body.description;
  try {
    const product = await Product.findById(prodId);
    if (!product) {
      const error = new Error('Could not find product.');
      error.statusCode = 404;
      throw error;
    }    
    if (product.creator.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== product.imageUrl) {
      clearImage(product.imageUrl);
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    product.imageUrl = imageUrl;
    await product.save();
    console.log('UPDATED PRODUCT!');
    res.status(201).json({ message: 'Product updated', productId: result._id });
  }
  catch(err) {
    next(err);
  };
};
  
exports.getProducts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 3;
  try {
    const totalItems = await Product.find().countDocuments();
    const products = await Product.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(201).json({ message: 'Show all products', products: products , currentPage: parseInt(currentPage) , totalPage: Math.ceil(totalItems/perPage) }); 
    }
    catch(err){
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
    };
  };
    
exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  console.log(prodId);
  try {
    const product = await Product.findById(prodId);
    if(!product){
      const error = new Error('Could not find product');
      error.statusCode = 404;
      throw error;
    }
    if (product.creator.toString() !== req.userId){
      const error = new Error ('Not Authorized');
      error.statusCode = 403;
      throw error;
    }
    clearImage(product.imageUrl);
    await Product.findByIdAndRemove(prodId);
    const user = await User.findById(req.userId);
    user.products.pull(prodId);
    await user.save();
    console.log('DESTROYED PRODUCT');
    res.status(201).json({ message: 'Deleted product'});
  }
  catch(err) {
    next(err);
  };
};


  const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, 
      err => 
      console.log(err));
  };
