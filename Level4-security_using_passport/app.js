//require('dotenv').config()
const express= require("express");
const bodyParser=require("body-parser");
const app= express();



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
       password:String
   });

   //connecting DB with passport
   userSchema.plugin(passportLocalMongoose);
      //create model
   const UserDB=mongoose.model("User",userSchema);

   //Use authenticate method of model in passport strategy
   passport.use(UserDB.createStrategy())

//start the cookie for the usero or make the user constant
   passport.serializeUser(UserDB.serializeUser());

   //close the browser and delete the session
   passport.deserializeUser(UserDB.deserializeUser());

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
})


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