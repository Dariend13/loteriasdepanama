const express = require('express');
const Horoscope = require('../models/Horoscope');
const WebSocket = require('ws');

module.exports = function (wss) {
    const router = express.Router();

    // Crear nuevo horóscopo
    router.post('/', async (req, res) => {
        console.log("Petición recibida para agregar un nuevo horóscopo");

        // Mostrar los datos que se reciben en el body de la petición
        console.log("Datos recibidos:", req.body);

        try {
            const horoscope = new Horoscope(req.body);
            console.log("Instancia de Horoscope creada:", horoscope);

            await horoscope.save();
            console.log("Horóscopo guardado en la base de datos:", horoscope);

            // Notificar a los clientes WebSocket
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    console.log("Enviando datos al cliente WebSocket");
                    client.send(JSON.stringify({
                        type: 'NEW_HOROSCOPE_ADDED',
                        data: horoscope
                    }));
                }
            });

            console.log("Enviando respuesta exitosa al cliente");
            res.status(201).send(horoscope);

        } catch (err) {
            console.error("Error al agregar horóscopo:", err.message);
            res.status(400).send({ error: err.message });
        }
    });

    // Reiniciar todos los horóscopos
    router.put('/reset', async (req, res) => {
        try {
            await Horoscope.updateMany({}, {
                $set: {
                    horoscope: '',     // Aquí se ajustó 'prediccion' por 'horoscope'
                    date: new Date()
                }
            });

            res.status(200).send({ message: 'Horóscopos reiniciados con éxito' });
        } catch (err) {
            res.status(500).send({ error: err.message });
        }
    });

    // Actualizar horóscopo
    router.put('/:id', async (req, res) => {
        try {
            const updatedHoroscope = await Horoscope.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedHoroscope) {
                return res.status(404).send({ message: 'Horoscope not found' });
            }

            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'HOROSCOPE_UPDATED',
                        data: updatedHoroscope
                    }));
                }
            });

            res.send(updatedHoroscope);
        } catch (err) {
            res.status(400).send({ error: err.message });
        }
    });

    // Obtener horóscopo por signo
    router.get('/sign/:sign', async (req, res) => {
        try {
            const sign = req.params.sign;
            const horoscope = await Horoscope.findOne({ sign: sign });
            if (!horoscope) {
                return res.status(404).send({ message: 'Horoscope not found for the given sign' });
            }
            res.send(horoscope);
        } catch (err) {
            res.status(500).send({ error: err.message });
        }
    });


    // Obtener horóscopos
    router.get('/', async (req, res) => {
        try {
            const horoscopes = await Horoscope.find();
            res.send(horoscopes);
        } catch (err) {
            res.status(500).send({ error: err.message });
        }
    });

    // Obtener horóscopo por ID
    router.get('/:id', async (req, res) => {
        try {
            const horoscope = await Horoscope.findById(req.params.id);
            if (!horoscope) {
                return res.status(404).send({ message: 'Horoscope not found' });
            }
            res.send(horoscope);
        } catch (err) {
            res.status(500).send({ error: err.message });
        }
    });

    // Eliminar horóscopo
    router.delete('/:id', async (req, res) => {
        try {
            const deletedHoroscope = await Horoscope.findByIdAndDelete(req.params.id);
            if (!deletedHoroscope) {
                return res.status(404).send({ message: 'Horoscope not found' });
            }

            // Notificar a los clientes WebSocket
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    console.log("Enviando datos al cliente WebSocket");
                    client.send(JSON.stringify({
                        type: 'HOROSCOPE_DELETED',
                        data: deletedHoroscope
                    }));
                }
            });

            res.send(deletedHoroscope);
        } catch (err) {
            res.status(500).send({ error: err.message });
        }
    });

    return router;
};
