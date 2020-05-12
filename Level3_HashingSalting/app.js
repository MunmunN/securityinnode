//require('dotenv').config()
const express= require("express");
const bodyParser=require("body-parser");
const app= express();
//A library to help you hash passwords.
const bcrypt = require('bcrypt');
const saltRounds = 10;


app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
//console.log(md5('hello'));
//Database code
//connecting with database
const mongoose=require("mongoose");
 const url="mongodb://127.0.0.1:27017/User_DB";

mongoose.connect(url,{useNewUrlParser:true,});
    //check if we are connected or not
   const db=mongoose.connection;
   db.once('open',function(){
       console.log("Database Connected");
   });

   
   
   const userSchema=new mongoose.Schema({
       email:String,
       password:String
   });
   
   //create model
   const UserDB=mongoose.model("User",userSchema);

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

//post function
//post function for signup page
app.post("/register",function(req,res){
    const form_email=req.body.email;
    const form_password=req.body.password;
    //To hash a password using bcrypt
    bcrypt.hash(form_password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        if(!err){
            //create new user
    const newuser=new UserDB({
        email:form_email,
        password:hash
        
    })
    newuser.save();
    res.render('myaccount')

    }
    });
    
});
    
                
// ****************************
// post function for login
app.post("/login",function(req,res){
    const form_email=req.body.email;
    const form_password=req.body.password;//123
    
   UserDB.findOne({email:form_email},function(err,foundItem){
        if(!err){
            //if user does not exists, redirect to signup page
            if(!foundItem){
                //console.log("User does not exist");
                res.render("register");
            //if user exists, render to the user(account)login
            }
            else{
                //check to see password for same user is same or not
                // Load hash from your password DB.
                bcrypt.compare(form_password, foundItem.password, function(err, result) {
                    // result == true
                    res.render("myaccount");
                });

                
                
            }
        }
    });

});




 app.listen(3000,function(){
     console.log("Server is running on 3000");
 });