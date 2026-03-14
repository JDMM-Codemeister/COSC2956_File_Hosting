const express = require("express");
const multer = require("multer");
const path = require("path");
const {Pool} = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config();

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432
});


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
app.post("/login", async (req,res) => {
    const email = req.body.email;
    const password = req.body.password


    //process email for cleanlieness, return if unclean
    if(!isValidEmail(email)){
        return res.json({message: "Invalid Email"});
    }

    //validate if password is good, retunr message if not
    if(!isValidPassword(password)){
        return res.json({message: "Password: 8+ char, 1 digit, 1 uppercase "});
    }

    //Login: check if user exists, login if so
    //Check if user exists, if so return and inform user
    const queryResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if(queryResult.rows.length > 0){
        //user exists, login

        //verify password is correct
        const result = await pool.query("SELECT password FROM users WHERE email = $1", [email]);
        const storedPassword = result.rows[0].password;

        const match = await bcrypt.compare(password, storedPassword);


        //grant access to files etc.
        //test message
        if(match){
            //access now granted

            //test message
            return res.json({message: "Logged in"});
        }else{
            return res.json({message: "Invalid credentials"});

        }
        

    }else{
        //user does not exist
        return res.json({message: "User does not exist"});
    }

});

//register
app.post("/register", async (req,res) => {
    const email = req.body.email;
    const password = req.body.password


    //process input for cleanlieness, return if unclean
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        return res.json({message: "Invalid input"});
    }

    //Check if user exists, if so return and inform user
    const queryResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if(queryResult.rows.length > 0){
        //user exists
        return res.json({message: "User already exists"});

    }else{
        //user does not exist

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //insert into users DB
        await pool.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, hashedPassword])

        //return to login screen
        return res.json({message: "Successful registration"});
    }




});



app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});