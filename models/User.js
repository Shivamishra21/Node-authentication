// This is model part of mvc architecture . In model we store data our application is using like data base so here we basically created thev schema ie. how our collection will look like and then created a model and exported it to use in our controller functions

//PASSWORD HASHING PROCESS
//user_password  + salt(it is a random string to protect password)-------> HASHING ------------> password that'll be saved to database

const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt"); //this will be used for password hashing.

//creating the schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    // the first element is the value and second is the error msg when error occured due to some inappropriate value provided
    required: [true, "Please enter a email!"],
    //we cantdo same for unique
    unique: true,
    lowercase: true,
    // this will validate if the string enterred is a valid email or not. We'll be using third paarty library validator . val->value enterrred by user

    //it will refrence function isEmail from validator and check if its valid or not.
    validate: [isEmail, "Please enter a valid email."],
  },
  password: {
    type: String,
    required: [true, "Please enter a email!"],
    minlength: [6, "Length of the password s hould be atleast 6 characters."],
  },
});

//   fire a function after the data has been saved to database
// userSchema.post("save", function (doc, next) {
//   console.log("new user is created with creds : ", doc);
//   next(); //this should be called at end of middleware otherwise site will hang.
// });

//this methods make the hashed password bt the password saved to mongodb isnot hashed one
// userSchema.pre("save", function (next) {
//   bcrypt.genSalt().then((salt) => {
//     bcrypt.hash(this.password, salt).then((password) => {
//       this.password = password;
//     });
//   });

//   next();
// });

//fire a function before doc saved to db
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.statics.login = async function (email, password) {
 
  const user = await this.findOne({ email: email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("Incorrect password");
  }
  throw Error("incorrect email");
};


//the name of the model should be singular of our db name
const User = mongoose.model("user", userSchema);
module.exports = User;
