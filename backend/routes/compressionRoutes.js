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
        if (file.mimetype === 'application/pdf') {
            // Compresión de archivos PDF
            const pdfDoc = await PDFDocument.load(fs.readFileSync(file.path));
            const pages = pdfDoc.getPages();

            // Redimensionar imágenes dentro del PDF (si es posible)
            for (const page of pages) {
                const { width, height } = page.getSize();
                page.scaleContent(0.8, 0.8); // Escala todo el contenido, incluidas las imágenes
            }

            const pdfBytes = await pdfDoc.save();
            compressedFilePath = path.join('uploads', `compressed_${file.originalname}`);
            fs.writeFileSync(compressedFilePath, pdfBytes);

            res.download(compressedFilePath, file.originalname, () => {
                fs.unlinkSync(file.path);
                fs.unlinkSync(compressedFilePath);
            });
        } else if (file.mimetype.startsWith('image/')) {
            // Compresión de imágenes
            compressedFilePath = path.join('uploads', `compressed_${file.originalname}`);
            await sharp(file.path)
                .resize({ width: 800 }) // Ajusta el tamaño según sea necesario
                .jpeg({ quality: 70 }) // Ajusta la calidad según sea necesario
                .toFile(compressedFilePath);

            res.download(compressedFilePath, file.originalname, () => {
                fs.unlinkSync(file.path);
                fs.unlinkSync(compressedFilePath);
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
