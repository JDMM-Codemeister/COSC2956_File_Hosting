const express = require("express");
const multer = require("multer");
const path = require("path");
const {Pool} = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const fs = require("fs");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432
});

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, "uploads/");
    },
    filename: (req,file,cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});


const app = express();

app.use(express.json());
app.use(express.static("public"));


function isValidEmail(email){
   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password){
    return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

function verifyToken(req,res,next){
    const token = req.headers.authorization?.split(" ")[1];

    if(!token) return res.json({message: "Missing token"});

    try{
        const decodedToken = jwt.verify(token, process.env.WEB_TOKEN);
        req.user = decodedToken;
        next();
    }catch{
        return res.json({message: "Invalid token"});
    }
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

            //issue token to user
            const token = jwt.sign({email: email}, process.env.WEB_TOKEN, {expiresIn: "1h"});


            //return token and message
            return res.json({message: "Logged in", token: token});

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


//upload
app.post("/upload", verifyToken, upload.single("file"), async (req,res) => {

    try{
        const email = req.user.email;
        const file = req.file;
        const customFilename = req.body.customFilename;

        //proceed with upload
        if(!file){
            return res.json({message: "No file uploaded"});
        }

        //upload to files db
        const result = await pool.query("SELECT id from users WHERE email = $1", [email]);
        const userID = result.rows[0].id;

        await pool.query("INSERT INTO files (user_id, filename, path, file_size) VALUES ($1,$2,$3,$4)", [userID,customFilename,file.path, file.size]);

        return res.json({message: "File was uploaded"});
    } catch(e){
        console.error(e);
        return res.json({message: e.message});
    }
});


//delete
app.delete("/delete", verifyToken, async (req,res) => {
    try{
        const email = req.user.email;
        const filenameDelete = req.body.customFilename;

        //get user id
        const result = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        const userID = result.rows[0].id;

        //should only work if there is a good match
        const fileResults = await pool.query("SELECT path FROM files WHERE filename = $1 AND user_id =$2", [filenameDelete, userID]);

        //if no file found
        if(fileResults.rowCount === 0){
            return res.json({message: "File not found"});
        }


        //delete DB entry before delete from uploads/
        //delete if user id matches uploader id (from DB)
        const deleted = await pool.query("DELETE FROM files WHERE user_id = $1 AND filename = $2", [userID, filenameDelete]);


        //now delete from uploads/
        const pathToDelete = fileResults.rows[0].path;
        fs.unlinkSync(pathToDelete);

        //upon good delete
        return res.json({message: "File deleted"});


    }catch(e){
        console.error(e);
        return res.json({message: e.message});
    }
});


app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});