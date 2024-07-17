const express = require('express');

const app = express();

const mysql = require('mysql2');

const cors = require('cors');

const bcrypt = require('bcrypt');

const dotenv = require('dotenv');

app.use(express.json());
app.use(cors()); // to allow cross-origin requests sharing
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});    

db.connect((err) => {
    if(err) return console.log("Error connecting to MySQL", err);
   
        console.log("Connected to MySQL: ", db.threadId);

        db.query(`CREATE DATABASE IF NOT EXISTS expense_tracker`, (err, result) => {
            if(err) return console.log(err);

            console.log("Database expense _tracker created successfully");

            //select our database
            db.changeUser({database: 'expense_tracker'}, (err) => {
                if(err) return console.log(err);
                console.log("Database selected successfully");
            });

            //create users table
            const createUsersTable = `CREATE TABLE IF NOT EXISTS expense_tracker.users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                email VARCHAR(50) NOT NULL,
                password VARCHAR(255) NOT NULL
            )`;
            db.query(createUsersTable, (err, result) => {
                if(err) return console.log(err);
                console.log("Table users created successfully");
            });
        })

});

//user registration route
app.post('/api/register', async (req, res)=>{
    try{
        const users = 'SELECT * FROM users WHERE email = ?';

        db.users(users, [req.body.email],  (err, data) => {
            if(data.length > 0) return  res.status(409).json("User already exists");

            const alt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(req.body.password, salt);

            const createUser = `INSERT INTO users (username, email, password) VALUES (?)`;
            value = [
                req.body.username,
                req.body.email,
                hashedPassword
            ];
        })

        //insert new user
        db.query(newUser, [value], (err, data) => {
            if(err) return res.status(500).json("Internal server error");

            res.status(201).json("User created successfully");
        })
    }catch(err){
        res.status(500).json("Internal server error");
    }
})

//user login route
app.post('/api/login', async (req, res) => {
    try{
        const users = 'SELECT * FROM users WHERE email = ?';

        db.query(users, [req.body.email], (err, data) => {
            if(data.length === 0) return res.status(404).json("User not found");

             //check if password is valid
            const isPasswordValid = bcrypt.compareSync(req.body.password, data[0].password);

            if(!isPasswordValid) return res.status(401).json("Invalid email or password");

            return res.status(200).json("Login successful");
        })
    }catch(err){
        res.status(500).json("Internal server error");
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});