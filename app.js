const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const fs = require('fs');
const jwt = require('jsonwebtoken');

const saltRounds = process.env.SALT_ROUNDS || 10;
const jwtSecret = process.env.JWT_SECRET || 'super_strong_64char';

const data = fs.readFileSync('data.json');
const userData = JSON.parse(data);
const verifyUser = require('./middleware').verifyUser;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(verifyUser);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/register', (req, res) => {
    const receivedData = req.body;
    const plainPassword = receivedData.password;

    bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: 'Error hashing password' });
        }
        receivedData.password = hashedPassword;
        let userModel = {
                "id": receivedData.id || Date.now().toString(),
                "password": hashedPassword
            };
        userData[receivedData.username] = userModel;        
        res.status(201).json({
            message: 'User registered successfully',
            userData: receivedData.username
        });
        console.log(userData);
    });
});

app.post('/login', (req, res) => {
    const user = req.body;
    const storedUser = userData[user.username];

    if (!storedUser) {
        return res.status(404).json({ error: 'User not found' });
    }

    bcrypt.compare(user.password, storedUser.password, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Error comparing passwords' });
        }
        if (result) {
            const token = jwt.sign(
                {
                    sub: storedUser.id,
                    username: user.username
                },
                jwtSecret,
                { expiresIn: '1h' }
            );
            res.json({ message: 'Login successful', token: token });
        } else {
            res.status(401).json({ error: 'Invalid username/password' });
        }
    });
});

module.exports = app;