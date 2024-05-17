const express = require('express');
const multer = require('multer');
const passport = require('../config/passport');
const Computer = require('../models/Inventory');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Configuración de AWS S3
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Configuración de Multer para el almacenamiento en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para crear una nueva entrada de computadora
router.post('/', passport.authenticate('jwt', { session: false }), upload.array('images', 5), async (req, res) => {
    try {
        const imagesUrls = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadParams = {
                    Bucket: process.env.AWS_S3_BUCKET_NAME,
                    Key: `inventory/${Date.now()}_${file.originalname}`,
                    Body: file.buffer,
                };

                const uploadResult = await s3Client.send(new PutObjectCommand(uploadParams));
                // Asegúrate de que la URL se construye correctamente
                const imageUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
                console.log("Generated Image URL: ", imageUrl); // Debug: Verifica la URL generada
                imagesUrls.push(imageUrl);
            }
        }

        // Asegúrate de que los datos se añaden correctamente
        console.log("Image URLs to be saved: ", imagesUrls);

        const newComputerData = {
            ...req.body,
            images: imagesUrls // Guarda todas las URLs de imágenes
        };

        const newComputer = new Computer(newComputerData);
        await newComputer.save();

        res.status(201).send({ message: 'Computadora agregada correctamente!', data: newComputer });
    } catch (err) {
        console.error('Error saving:', err);
        res.status(500).send({ error: err.message });
    }
});

// Ruta para obtener los detalles de una computadora específica
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const computer = await Computer.findById(req.params.id);
        if (!computer) {
            return res.status(404).send({ message: 'Computadora no encontrada!' });
        }
        res.send(computer);
    } catch (err) {
        console.error('Error fetching computer details:', err);
        res.status(500).send({ error: err.message });
    }
});

// Ruta para obtener todas las computadoras
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const computers = await Computer.find({});
        res.send(computers);
    } catch (err) {
        console.error('Error fetching!', err);
        res.status(500).send({ error: err.message });
    }
});

// Ruta para actualizar una entrada de computadora
router.put('/:id', passport.authenticate('jwt', { session: false }), upload.single('image'), async (req, res) => {
    try {
        const updateData = req.body;
        if (req.file) {
            const uploadResult = await s3.upload({
                Bucket: process.env.AWS_S3_BUCKET_NAME,
                Key: `inventory/${Date.now()}_${req.file.originalname}`,
                Body: req.file.buffer,
                ACL: 'public-read'
            }).promise();

            updateData.imageUrl = uploadResult.Location;
        }

        const updatedComputer = await Computer.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.send({ message: 'Computadora actualizada correctamente!', data: updatedComputer });
    } catch (err) {
        console.error('Error actualizando:', err);
        res.status(500).send({ error: err.message });
    }
});

// Ruta para eliminar una entrada de computadora
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        await Computer.findByIdAndRemove(req.params.id);
        res.send({ message: 'Inventario borrado correctamente!' });
    } catch (err) {
        console.error('Error borrando inventario!', err);
        res.status(500).send({ error: err.message });
    }
});

module.exports = router;
