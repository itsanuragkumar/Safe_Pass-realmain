// server.js

const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Mock user database
const users = {};

// Route to register a new user (for demonstration purposes)
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (users[username]) {
        return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = {
        password: hashedPassword,
        pin: null, // To be set later
        twoFA: false, // Assume 2FA is already set up
    };

    res.send('User registered successfully');
});

// Route to set up the PIN
app.post('/set-pin', async (req, res) => {
    const { username, pin } = req.body;

    if (!users[username]) {
        return res.status(400).send('User not found');
    }

    if (!pin || pin.length < 4 || pin.length > 8 || !/^\d+$/.test(pin)) {
        return res.status(400).send('PIN must be 4-8 digits');
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    users[username].pin = hashedPin;

    res.send('PIN set successfully');
});

// Route to authenticate with 3FA (assuming 2FA is already handled)
app.post('/authenticate', async (req, res) => {
    const { username, password, pin } = req.body;

    const user = users[username];
    if (!user) {
        return res.status(400).send('Invalid username or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(400).send('Invalid username or password');
    }

    if (!user.pin) {
        return res.status(400).send('PIN not set for this user');
    }

    const pinMatch = await bcrypt.compare(pin, user.pin);
    if (!pinMatch) {
        return res.status(400).send('Invalid PIN');
    }

    res.send('Authentication successful');
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
