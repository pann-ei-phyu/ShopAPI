const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const shopRoute = require('./routes/shop');
const adminRoute = require('./routes/admin');
const userRote = require('./routes/user');
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
    //console.log(cb);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
//const User = require('./model/user');
const app = express();
app.use(cors());

//const { join } = require('path');

//const mongoConnect = require('./util/database').mongoConnect;


//const mongoose = require('mongoose');


// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  //multer({ dest : 'images' }).single('image')
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
 app.use(express.static(path.join(__dirname, 'public')));
 app.use('/images', express.static(path.join(__dirname, 'images')));

//  app.use((req, res, next) => {
//     // res.setHeader('Access-Control-Allow-Origin', '*');
//     // res.setHeader(
//     //   'Access-Control-Allow-Methods',
//     //   'OPTIONS, GET, POST, PUT, PATCH, DELETE'
//     // );
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
//   });

 app.use(adminRoute);

//app.use('/shop', shopRoute);

app.use('/user', userRote);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
  });
  



/*mongoConnect(() => {
    app.listen(8080);
})*/

mongoose.connect('mongodb+srv://PanEiPhyu:fkJcwEi1oDzCyefA@cluster0.poixt.mongodb.net/shop')
.then( result => {
    app.listen(8080, function () {
      console.log('CORS-enabled web server listening on port 8080')
    });
}) 
.catch(err =>{
    console.log(err);
});