const mongodb = require('mongodb');

const Product = require('../model/product');

const ObjectId = mongodb.ObjectId;

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

exports.postAddProduct= (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const imageUrl = req.body.imageUrl;
  const creator = req.body.creator;
  //console.log(req.body);
  const product = new Product ({
      title: title, 
      price: price, 
      description: description, 
      imageUrl: imageUrl,
      creator: creator
    });
  product.save()
  .then(result => {
    console.log('created product');
    res.status(201).json({ message: 'Product created!', productId: result._id });
  })
  .catch(err => {
    next(err) ;
  })
  };

  exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    console.log(editMode);
    if (!editMode) {
      return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
      .then(product => {
        if (!product) {
          return res.redirect('/');
        }
        console.log(product);
        res.status(201).json({ message: 'This is edit product', productId: product._id });
      })
      .catch(err => console.log(err));
  };
  

  exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.prodId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    
    Product.findById(prodId)
      .then(product => {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.description = updatedDesc;
        product.imageUrl = updatedImageUrl;
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
    Product.find()
      .then(products => {
        console.log(products);
        res.status(201).json({ message: 'Show all products', products: products });
        return products;
        
      })
      .catch(err => {
        console.log(err);
      });
  };

  
    /*const prodId = '62e4f15b6feac670df19fd73';
    const updatedTitle = 'shoseupdate';
    const updatedPrice = 29;
    const updatedDesc = 'this is shoes update';
    const updatedImageUrl = 'https://static.onecms.io/wp-content/uploads/sites/23/2022/03/08/cole-haan-grandpro-rally-court-sneaker-optic-white-black-optic-white-tout.jpg';*/
    
  
  exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    //const prodId = '62e4f15b6feac670df19fd73';
    Product.findByIdAndRemove(prodId)
      .then(() => {
        console.log('DESTROYED PRODUCT');
        res.status(201).json({ message: 'Deleted product'});
        
      })
      .catch(err => console.log(err));
  };
