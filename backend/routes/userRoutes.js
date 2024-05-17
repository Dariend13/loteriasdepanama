const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
    try {
        const user = new User({
            username: req.body.username,
            password: req.body.password,
            role: req.body.role  // Asume que el rol se envía en la solicitud
        });
        await user.save();

        // Después de registrar con éxito, redirigir al usuario al dashboard
        res.redirect('/#/dashboard'); // Ajusta esto según la lógica de tu aplicación
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// Inicio de sesión
router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) {
            console.error('Error during authentication:', err);
            return res.status(500).send({ message: 'Internal server error' });
        }
        if (!user) {
            console.log('Authentication failed:', info.message);
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        req.user = user;
        next();
    })(req, res, next);
}, (req, res) => {
    const token = jwt.sign(
        { id: req.user.id, role: req.user.role }, // Añadir el rol del usuario al token
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
    res.send({ message: 'Logged in successfully', token, success: true });
});


module.exports = router;
