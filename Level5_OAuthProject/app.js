
//OAuth doesn't share password data but instead uses authorization 
//tokens to prove an identity between consumers and service providers.
require('dotenv').config()
const express= require("express");
const bodyParser=require("body-parser");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const app= express();
app.use(express.static('public'));//to attach css with app.js



app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
//Modules required for using passport
const session=require("express-session")
const passport=require("passport")
const passportLocalMongoose=require("passport-local-mongoose")

app.use(session({
    secret:"Our little secter",
    resave:false,
    saveUninitialized: false
}))

app.use(passport.initialize())//start initialize passport
app.use(passport.session())//session for passport




//console.log(md5('hello'));
//Database code
//connecting with database
const mongoose=require("mongoose");
 const url="mongodb://127.0.0.1:27017/User_DB";

mongoose.connect(url,{useNewUrlParser:true,});

//to avoid deprecation warning while using passport
mongoose.set("useCreateIndex",true);
    //check if we are connected or not
   const db=mongoose.connection;
   db.once('open',function(){
       console.log("Database Connected");
   });

   
   
   const userSchema=new mongoose.Schema({
       email:String,
       password:String,
       googleId:String
   });

   //connecting DB with passport
   userSchema.plugin(passportLocalMongoose);
   //plugin for findOrCreate
    userSchema.plugin(findOrCreate);
      //create model
   const UserDB=mongoose.model("User",userSchema);

   //Use authenticate method of model in passport strategy
   passport.use(UserDB.createStrategy())

//these will only work for mongoose and local strategy
//start the cookie for the usero or make the user constant
   //passport.serializeUser(UserDB.serializeUser());

   //close the browser and delete the session
  // passport.deserializeUser(UserDB.deserializeUser());

  //these function work for any strategy or plugin 
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    UserDB.findById(id, function(err, user) {
      done(err, user);
    });
  });
// to use passport-google-oauth strategy
   passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/myaccount"
  },
  function(accessToken, refreshToken, profile, cb) {
    UserDB.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

//home page
app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});
app.get("/myaccount",function(req,res){
    //check if user is authenticate or not
    if(req.isAuthenticated()){
        res.render("myaccount");
    }
    else{
        res.render("login")
    }
    
});
//logout
app.get("/logout",function(req,res){
     req.logout(); //to close the session and destroy the cookie
     res.redirect('/');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/myaccount', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/myaccount');
  });


//post function
//post function for signup page
app.post("/register",function(req,res){
    
    UserDB.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/myaccount");
            })
        }
    })
    
});
    
                
// ****************************
// post function for login
app.post("/login",function(req,res){
   const user=new UserDB({
    //    create a new user with login
       username:req.body.username,
       password:req.body.password
   }); 
   req.login(user,function(err){
       if(err){
           console.log(err);

       }
       else{
        passport.authenticate("local")(req,res,function(){
            res.redirect("/myaccount")
        })
       }
   })
   

});




 app.listen(3000,function(){
     console.log("Server is running on 3000");
 });