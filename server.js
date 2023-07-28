const mysql = require("mysql");
const express = require("express");
const fs=require("fs");
const app = express();
const bodyparser = require("body-parser");
const encoder = bodyparser.urlencoded({ extended: false });
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const path=require("path");

app.use("/public", express.static("public"));
app.use(bodyparser.json());

//store details in  mysql module about user and database he has
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "nodelogin",
  password: "Siva@2000",
});

//connection to the database
connection.connect((err) => {
  if (err) throw err;
  else console.log("connected");
});

//create a transporter object
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "duppalapudisiva990@gmail.com",
    pass: "qujillnophnhwsts", //application specific password
  },
});

//open registration page when user browse at /register endpoint
app.get("/register", (req, res) => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers='0123456789'
    let username = '';
    for (let i = 0; i < 5; i++) {
        username += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    for(let i=0;i<3;i++){
        username +=numbers.charAt(Math.floor(Math.random()*numbers.length))
    }
    fs.readFile(path.join(__dirname,"/public/registration.html"),'utf8',(err,data)=>{
      if(err){
        res.status(500).send("internal server error");
        return;
      }
      const modifiedHTML=data.replace("{{name}}",username);
      res.status(200).send(modifiedHTML);
    })
});
//sending js file along with html file of registration page
app.get("/registration.js", (req, res) => {
  res.set("Content-Type", "application/javascript");
  res.sendFile(__dirname + "/public/registration.js");
});

//variables used for querying to database
let otp = "",
  username,
  password,
  email;
//variables determaining key value and algorithm used to encrypt password
const key = crypto.randomBytes(32);
const algorithm = "aes-256-cbc";
const iv = crypto.randomBytes(16);
const keyHex = key.toString('hex');
const ivHex = iv.toString('hex');

//functions to be invoked when user sends registration form data
app.post("/register", encoder, function (req, res) {
  username = req.body.username;
  password = req.body.password;
  email = req.body.email;
  //checking wheather email already registered or not
  connection.query(
    "select email from accounts where email=?;",
    [email],
    (err, results, fields) => {
      if (results.length > 0) {
        if (results[0].email == email) {
          let message = "email already registered";
          res.redirect("/register?message=" + message);
        }
      } else {
        //for generating otp
        const num = "0123456789";
        otp = "";
        for (let i = 0; i < 6; i++) {
          otp += num.charAt(Math.floor(Math.random() * num.length));
        }

        // Define the email options
        let mailOptions = {
          from: "duppalapudisiva990@gmail.com",
          to: email,
          subject: "OTP for verification",
          text: otp,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            res.sendFile(__dirname + "/public/validation.html");
          }
        });
      }
    }
  );
});

//functions to be involked when user submits an otp
app.post("/verify-otp", (req, res) => {
  const enteredOtp = req.body.otp;
  const storedOtp = otp;
  if (enteredOtp == storedOtp) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(password, "utf8", "hex");
    encrypted += cipher.final("hex");
    connection.query(
      "INSERT INTO accounts (username, password, email, key_val, iv_val) VALUES (?, ?, ?, ?, ?);",
      [username, encrypted, email,keyHex,ivHex],
      function (err, results, fields) {
        if (err) {
          throw err;
        }

        let mailOption = {
          from: "duppalapudisiva990@gmail.com",
          to: email,
          subject: "Registration successful",
          text:
            "You have been successfully registered with the following details:\n\n" +
            "Email: " +
            email +
            "\nUsername: " +
            username +
            "\nPassword: " +
            password,
        };

        transporter.sendMail(mailOption, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            res.redirect("/login");
          }
        });
      }
    );
  }
});


//for login
app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/public/login.html");
});

//functions to be involked when user submits login form
app.post("/login", encoder, function (req, res) {
  var email = req.body.email;
  var password = req.body.password;
  connection.query(
    "select password,username,key_val,iv_val from accounts where email = ?;",
    [email],
    function (err, results, fields) {
      if (err) throw err;
      else {
        if (results.length > 0) {
          let k = results[0].password;
          let username = results[0].username;
          let keyHex = results[0].key_val; 
          let ivHex = results[0].iv_val; 
          let akey = Buffer.from(keyHex, 'hex');
          let aiv = Buffer.from(ivHex, 'hex');
          const decipher = crypto.createDecipheriv(algorithm, akey,aiv);
          let decrypted = decipher.update(k, "hex", "utf8");
          decrypted += decipher.final("utf8");
          if (decrypted == password) {
            let user = results[0].username;
            res.redirect("/email");
          } else {
            res.redirect("/invalid");
          }
        } else {
          res.redirect("/invalid");
        }
      }
      res.end();
    }
  );
});
//when login is success
app.get("/email", function (req, res) {
  res.sendFile(__dirname + "/public/email.html");
});
//when login is failed
app.get("/invalid", function (req, res) {
  res.sendFile(__dirname + "/public/invalid.html");
});
//setting app port
app.listen(4500);
