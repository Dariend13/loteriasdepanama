const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

const router = express.Router();

// Configurar Multer para manejar la carga de archivos
const upload = multer({ dest: 'uploads/' });

router.post('/compress', upload.single('file'), async (req, res) => {
    const file = req.file;

    try {
        if (file.mimetype === 'application/pdf') {
            // Compresión de archivos PDF
            const pdfDoc = await PDFDocument.load(fs.readFileSync(file.path));
            const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
            fs.writeFileSync(file.path, pdfBytes);
            res.download(file.path, 'compressed.pdf', () => {
                fs.unlinkSync(file.path); // Eliminar archivo después de la descarga
            });
        } else if (file.mimetype.startsWith('image/')) {
            // Compresión de imágenes
            await sharp(file.path)
                .resize({ width: 800 }) // Redimensionar la imagen si es necesario
                .toBuffer((err, buffer) => {
                    if (err) {
                        throw new Error('Error al comprimir la imagen');
                    }
                    fs.writeFileSync(file.path, buffer);
                    res.download(file.path, 'compressed_image.jpg', () => {
                        fs.unlinkSync(file.path); // Eliminar archivo después de la descarga
                    });
                });
        } else {
            res.status(400).send('Tipo de archivo no soportado');
        }
    } catch (err) {
        console.error('Error al comprimir el archivo:', err);
        res.status(500).send('Error al comprimir el archivo');
    }
});

module.exports = router;
