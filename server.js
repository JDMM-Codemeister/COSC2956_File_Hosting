const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static("public"));


function isValidEmail(email){
   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password){
    return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

//login
app.post("/login", (req,res) => {
    const email = req.body.email;
    const password = req.body.password


    //process email for cleanlieness, return if unclean
    if(!isValidEmail(email)){
        return res.json({message: "Invalid Email"});
    }

    //validate if password is good, retunr message if not
    if(!isValidPassword(password)){
        return res.json({message: "Password must be at least 8 char long and contain at least one digit and uppercase letter"});
    }


    

    //Login: check if user exists

    //Register: check if user already exists





});

//register
app.post("/register", (req,res) => {
    const email = req.body.email;
    const password = req.body.password


    //process input for cleanlieness, return if unclean
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        return res.json({message: "Invalid input"});
    }


    

    //Login: check if user exists

    //Register: check if user already exists





});




app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});