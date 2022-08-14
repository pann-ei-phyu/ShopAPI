const mongodb = require('mongodb');

const Product = require('../model/product');
const User = require('../model/user');
const path = require('path');
const fs = require('fs');

exports.postAddProduct= (req, res, next) => {
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
  product
  .save()
  .then(result => {
    return User.findById(req.userId);})
    .then(user => {
      creator= user;
      user.products.push(product);
      return user.save();
    })
    .then( result => {
    console.log('created product');
    res.status(201).json({ message: 'Product created!', productId: result._id,
    product: product,
    creator: {_id: creator._id, name: creator.name}
  });
    
  })
  .catch(err => {
    next(err) ;
  })
  };

  exports.getEditProduct = (req, res, next) => {
    // const editMode = req.query.edit;
    // console.log(editMode);
    // if (!editMode) {
    //   return res.redirect('/');
    // }
    const prodId = req.params.productId;
    Product.findById(prodId)
      .then(product => {
        if (!product) {
          const error = new Error('Could not find product.');
          error.statusCode = 404;
          throw error;
          //return res.redirect('/');
        }
        console.log(product);
        res.status(201).json({ message: 'This is edit product', product: product });
      })
      .catch(err => 
        next(err));
  };
  

  exports.postEditProduct = (req, res, next) => {
    const prodId = req.params.productId;
    //console.log(prodId);
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
    
    Product.findById(prodId)
      .then(product => {
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
        return product.save();
      })
      .then(result => {
        console.log('UPDATED PRODUCT!');
        res.status(201).json({ message: 'Product updated', productId: result._id });
      })
      .catch(err => 
        next(err)
      );
  };
  
  exports.getProducts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 3;
    let totalItems;
    
    Product.find()
      .countDocuments()
      .then(count => {
        totalItems = count;
        console.log(totalItems);
        return Product.find()
          .skip((currentPage - 1) * perPage)
          .limit(perPage);
      })
      .then(products => {
        console.log(products);
        res.status(201).json({ message: 'Show all products', products: products , currentPage: parseInt(currentPage) , totalPage: Math.ceil(totalItems/perPage) });
        return products;
        
      })
      .catch(err => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
    // Product.find()
    //   .then(products => {
    //     console.log(products);
    //     res.status(201).json({ message: 'Show all products', products: products });
    //     return products;
        
    //   })
    //   .catch(err => {
    //     next(err);
    //   });
  };

  
    /*const prodId = '62e4f15b6feac670df19fd73';
    const updatedTitle = 'shoseupdate';
    const updatedPrice = 29;
    const updatedDesc = 'this is shoes update';
    const updatedImageUrl = 'https://static.onecms.io/wp-content/uploads/sites/23/2022/03/08/cole-haan-grandpro-rally-court-sneaker-optic-white-black-optic-white-tout.jpg';*/
    
  
  exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    console.log(prodId);
    //const prodId = '62e4f15b6feac670df19fd73';
    Product.findById(prodId)
      .then(product => {
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
        return Product.findByIdAndRemove(prodId);
      })
      .then(result => {
        return User.findById(req.userId);
      })
      .then(user => {
        user.products.pull(prodId);
        return user.save();
      })
      .then(() => {
        console.log('DESTROYED PRODUCT');
        res.status(201).json({ message: 'Deleted product'});
        
      })
      .catch(err => 
        next(err));
  };


  const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, 
      err => 
      console.log(err));
  };
