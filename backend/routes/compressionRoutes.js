const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configurar Multer para manejar la carga de archivos
const upload = multer({ dest: 'uploads/' });

router.post('/compress', upload.single('file'), async (req, res) => {
    const file = req.file;

    try {
        let compressedFilePath;
        let originalSize = fs.statSync(file.path).size;
        let compressedSize;

        if (file.mimetype === 'application/pdf') {
            // Optimización básica de PDF con pdf-lib
            const pdfDoc = await PDFDocument.load(fs.readFileSync(file.path));
            const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
            compressedFilePath = path.join('uploads', `compressed_${file.originalname}`);
            fs.writeFileSync(compressedFilePath, pdfBytes);

            compressedSize = pdfBytes.length;
        } else if (file.mimetype.startsWith('image/')) {
            // Compresión de imágenes
            compressedFilePath = path.join('uploads', `compressed_${file.originalname}`);
            await sharp(file.path)
                .resize({ width: 800 }) // Ajusta el tamaño según sea necesario
                .jpeg({ quality: 50 })  // Ajusta la calidad para mejorar la compresión
                .toFile(compressedFilePath);

            compressedSize = fs.statSync(compressedFilePath).size;
        } else {
            res.status(400).send('Tipo de archivo no soportado');
            return;
        }

        // Enviar la respuesta con el tamaño original y comprimido
        res.json({
            downloadUrl: `/api/download/${path.basename(compressedFilePath)}`,
            originalSize,
            compressedSize,
        });

        // Eliminar archivo original
        fs.unlinkSync(file.path);

    } catch (err) {
        console.error('Error al comprimir el archivo:', err);
        res.status(500).send('Error al comprimir el archivo');
    }
});

router.get('/download/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../uploads', req.params.filename);
    res.download(filePath, (err) => {
        if (err) {
            console.error('Error al descargar el archivo:', err);
        } else {
            fs.unlinkSync(filePath); // Eliminar el archivo después de la descarga
        }
    });
});

module.exports = router;
