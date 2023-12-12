
// import http from "http";
// import gfName, { gfName2,gfName3,generateRandomNumber } from "./features.js";
// import path from "path"
// console.log(gfName);
// console.log(gfName2);
// console.log(gfName3);
// //console.log(generateRandomNumber());
// console.log(path.dirname("/home/index.js"));



// const server = http.createServer((req,res) => {
//     if(req.url==='/about'){
//         res.end(`<h1>Love is ${generateRandomNumber()} </h1>`);
//     }
//     else if(req.url==='/'){
//         res.end("<h1>Home Page</h1>");
//     }
//     if(req.url==='/contact'){
//         res.end("<h1>Contact Page</h1>");
//     }
//     else{
//         res.end("<h1>Page Not Found</h1>");
//     }
//     res.end("<h1>hello world</h1>");
// })

// server.listen(5000,() => {
//     console.log("Server is working");
// })

//       After isntalling express

import express from "express";
import path from "path";
import mongoose from "mongoose"
//import { name } from "ejs";
import cookieParser from "cookie-parser";
import { name } from "ejs";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName: "backend",
}).then(()=> console.log("Database Connected"))
.catch((e) => console.log("e"));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});
const User = mongoose.model("User",userSchema);

const app = express();



//using middleware and connecting static index.html file with server
 app.use(express.static(path.join(path.resolve(),"public")));
 app.use(express.urlencoded({extended : true}));
 app.use(cookieParser());

//setting up view engine
 app.set("view engine","ejs");

app.listen(5000, () => {
    console.log("Server is working ");
});
app.get("/login",(req,res)=>{
    res.render("login");
})
app.get("/Register",(req,res)=>{
    // console.log(req.user);
    res.render("Register");
 })
app.post("/login",async (req,res) => {
    const {email,password} = req.body;

    let user = await User.findOne({email});

    if(!user){
        return res.redirect("/Register");
    }

    //const isMatch = user.password === password
    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.render("login",{ email ,message:"Password is incorrect"})
    }

    const token = jwt.sign({_id:user._id},"sdjebjdmd");
   
    res.cookie("token",token,{
        httpOnly:true,expires: new Date(Date.now()+60*1000)
    });
    res.redirect("/");
})
app.post("/Register", async (req,res) => {
    const {name,email,password} = req.body;
    let user = await User.findOne({email});
    if(user){
        return res.redirect("/login");
    }

    const hashedPassword = await bcrypt.hash(password,10);
    user = await User.create({
        name,
        email,
        password: hashedPassword,
    })

    // const token = jwt.sign({_id:user._id},"sdjebjdmd");
   
    // res.cookie("token",token,{
    //     httpOnly:true,expires: new Date(Date.now()+60*1000)
    // });
    res.redirect("/");
})

app.get("/logout",(req,res) => {
    res.cookie("token",null,{
        httpOnly:true,
        expires: new Date(Date.now())
    });
    res.redirect("/");
})

// app.get("/",(req,res) => {
//     //res.send("Hi");
//     //res.sendStatus(400);
//     // res.json({
//     //     success: true,
//     //     products: [],
//     // });
//     //const pathLocation=path.resolve();
//      //res.render("index",{ name:"Gentleman" });
//      //res.sendFile("index");
//      //console.log(req.cookies);
//      const {token} = req.cookies;
//      if(token){
//         res.render("logout");
//      }
//      else{
//         res.render("login");
//      }
    
// })
const isAuthenticated = async (req,res,next)=>{
    const {token} = req.cookies;
     if(token){
        const decoded = jwt.verify(token,"sdjebjdmd");
        req.user =  await User.findById(decoded._id);
        next();
     }
     else{
        res.redirect("/login");
     }
}
app.get("/",isAuthenticated,(req,res)=>{
     console.log(req.user);
    res.render("logout",{ name: req.user.name});
})





