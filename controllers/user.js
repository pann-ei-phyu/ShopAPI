const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const mongodb = require('mongodb');
const jwt = require('jsonwebtoken');

const User = require('../model/user');



//const ObjectId = mongodb.ObjectId;


exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed.');
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

  const email = req.body.email;
  const name = req.body.username;
  const password = req.body.password;
  try { 
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPw,
      name: name
    });
    const result = await user.save();
    res.status(201).json({ message: 'User created!', userId: result._id });
  }
  catch(err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  };
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    const error = new Error('User input validation fail');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  let loadUser;
  try {
    const user = await User.findOne({ email: email });
    if(!user){
      const error = new Error('Invalid Email');
      error.statusCode = 401;
      error.data = [{reason: 'User Error'}];
      throw error;
    }
    loadUser = user;
    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword){
      const error = new Error('Invalid Password')
      error.statusCode = 401;
      error.data = [{reason: 'User Error'}];
      throw error;
    }
    const token = jwt.sign(
      { 
        email: loadUser.email, userId:loadUser._id.toString()
      },
      'secret', { expiresIn: '24h' });
      res.status(200).json({ token: token, userId: loadUser._id.toString() });
  }
  catch(err)  {
    next(err) ;
  }
}

  
