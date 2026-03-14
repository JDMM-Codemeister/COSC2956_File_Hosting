const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static("public"));


//login/register
app.post("/login-register", (req,res) => {
    const email = req.body.email;
    const password = req.body.password

});




app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});