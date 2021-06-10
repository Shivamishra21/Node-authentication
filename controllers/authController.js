require("dotenv").config();
const User = require("../models/User");
const jwt = require("jsonwebtoken");



//handle errors
const handleErrors = (err) => {
  let error = { email: "", password: "" };
  if(err.message === 'incorrect email'){
    error.email = 'This email is not registered.'
  } 

  if(err.message === 'Incorrect password'){
    error.password = 'Password incorrect.'
  }

  if (err.code === 11000) {
    error.email = "This email is already registered.";
    return error;
  }

  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      error[properties.path] = properties.message;
    });
  }

  return error;
};




const maxAge = 3 * 24 * 60 * 60; // in second this value is of three days in second
const createToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: maxAge,
  });
};



// controller actions
module.exports.signup_get = (req, res) => {
  res.render("signup");
};




module.exports.login_get = (req, res) => {
  res.render("login");
};





module.exports.signup_post = (req, res) => {
  const { email, password } = req.body;

  User.create({ email, password })
    .then((user) => {
      const token = createToken(user._id);
      res.cookie("jwt", token, {
        httpOnly: true, //this means that value of jwt cant be changed from frontend (document.cookie = "any string")
        maxAge: maxAge * 1000, //after that cookie is automatically deleted from browser (it is value of three days)
      });
      res.status(201).json({ user: user._id });
    })

    .catch((err) => {
      console.log(err.message);
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    });
};






module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  User.login(email, password)
    .then((user) => {
      const token = createToken(user._id);
      res.cookie('jwt',token,{
        httpOnly:true,
        maxAge:maxAge*1000
      })
      res.status(200).json({ user: user._id });
    })
    .catch((err) => {
      const errors = handleErrors(err)
      console.log("Error = ", err);
      res.status(400).json({errors});
    });
};





module.exports.logout_get = (req,res)=>{
  // res.clearCookie('jwt');
  res.cookie('jwt','',{
    maxAge:1
  })
  console.log('cleard');
   res.redirect('/');
}