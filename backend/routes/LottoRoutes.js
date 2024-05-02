const express = require('express');
const router = express.Router();
const Lotto = require('../models/Lotto');  // Asegúrate de ajustar la ruta según tu estructura de archivos
const Pega3 = require('../models/Pega3');  // Asegúrate de ajustar la ruta según tu estructura de archivos
const passport = require('../config/passport');
const WebSocket = require('ws');
const moment = require('moment-timezone');

module.exports = function (wss) {
    const router = express.Router();

    //Formateo para la fecha
    const formatDate = (date) => {
        if (!date) date = new Date();

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    // Función para notificar a los clientes
    const notifyClients = (game, modelType, changedField) => {
        const formattedGame = {
            ...game._doc,
            fecha: formatDate(game.fecha)
        };

        console.log('Notificando a clientes:', formattedGame, 'Campo cambiado:', changedField);

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'UPDATE_GAME',
                    model: modelType,
                    game: formattedGame,
                    changedField: changedField
                }));
            }
        });
    };

    // CRUD para Lotto

    // Leer todos
    router.get('/', async (req, res) => {
        try {
            console.log("Fetching Lotto data...");
            // Agrega un ordenamiento descendente por la fecha y limita los resultados a 5
            const lottos = await Lotto.find().sort({ date: -1 }).limit(5);
            console.log("Lotto data fetched:", lottos);
            res.json(lottos);
        } catch (err) {
            console.error("Error fetching Lotto data:", err);
            res.status(500).json({ message: err.message });
        }
    });
      

    // Leer uno
    router.get('/lotto/:id', async (req, res) => {
        try {
            const lotto = await Lotto.findById(req.params.id);
            if (lotto == null) {
                return res.status(404).json({ message: 'No se pudo encontrar el Lotto con el ID especificado' });
            }
            res.json(lotto);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    });

    // Crear
    router.post('/create/lotto', passport.authenticate('jwt', { session: false }), async (req, res) => {
        console.log('Datos recibidos:', req.body);
        try {
            const lotto = new Lotto(req.body);
            await lotto.save();

            const lottoToSend = {
                ...lotto._doc,
                fecha: formatDate(lotto.fecha)
            };

            wss.clients.forEach(client => {
                client.send(JSON.stringify({
                    type: 'NEW_LOTTO_ADDED',
                    data: lottoToSend
                }));
            });

            res.status(201).send(lotto);
        } catch (err) {
            console.error('Error al guardar el Lotto:', err);
            res.status(400).send({ error: err.message });
        }
    });

    // Ruta para actualizar Lotto
    router.put('/update/lotto/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
        await updateGame(req, res, Lotto, 'Lotto');
    });

    router.put('/complete/:gameType/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
        try {
            // Selecciona el modelo según el tipo de juego
            let Game;
            switch (req.params.gameType.toLowerCase()) {
                case 'lotto':
                    Game = Lotto;
                    break;
                case 'pega3':
                    Game = Pega3;
                    break;
                default:
                    return res.status(400).send({ success: false, message: 'Invalid game type' });
            }

            const game = await Game.findById(req.params.id);

            if (!game) {
                return res.status(404).send({ success: false, message: 'Game not found' });
            }

            game.status = 'completed';

            await game.save();

            // Aquí se envía una respuesta con un campo 'success' y el juego actualizado.
            res.send({ success: true, game: game });

        } catch (err) {
            res.status(400).send({ success: false, error: err.message });
        }
    });

    // Eliminar
    router.delete('/lotto/:id', async (req, res) => {
        try {
            await Lotto.findByIdAndDelete(req.params.id);
            res.json({ message: 'Lotto eliminado exitosamente' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

    // CRUD para Pega3

    // Leer todos
    router.get('/pega3', async (req, res) => {
        try {
            const pega3s = await Pega3.find();
            res.json(pega3s);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

    // Leer uno
    router.get('/pega3/:id', async (req, res) => {
        try {
            const pega3 = await Pega3.findById(req.params.id);
            if (pega3 == null) {
                return res.status(404).json({ message: 'No se pudo encontrar Pega3 con el ID especificado' });
            }
            res.json(pega3);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    });

    // Crear
    router.post('/create/pega3', passport.authenticate('jwt', { session: false }), async (req, res) => {
        console.log('Datos recibidos:', req.body);
        try {
            const pega3 = new Pega3(req.body);
            await pega3.save();

            const pega3ToSend = {
                ...pega3._doc,
                fecha: formatDate(pega3.fecha)
            };

            wss.clients.forEach(client => {
                client.send(JSON.stringify({
                    type: 'NEW_PEGA3_ADDED',
                    data: pega3ToSend
                }));
            });

            res.status(201).send(pega3);
        } catch (err) {
            console.error('Error al guardar el Pega3:', err);
            res.status(400).send({ error: err.message });
        }
    });

    // Ruta para actualizar Pega3
    router.put('/update/pega3/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
        await updateGame(req, res, Pega3, 'Pega3');
    });

    // Eliminar
    router.delete('/pega3/:id', async (req, res) => {
        try {
            await Pega3.findByIdAndDelete(req.params.id);
            res.json({ message: 'Pega3 eliminado exitosamente' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    });

    // Función para actualizar el juego
    const updateGame = async (req, res, model, modelType) => {
        delete req.body._id;
        console.log('Datos recibidos:', req.body);

        if (req.body.fecha === null) {
            req.body.fecha = moment().tz("America/Panama").startOf('day').toDate();
        }

        try {
            const originalGame = await model.findById(req.params.id);
            if (!originalGame) {
                return res.status(404).send({ message: 'Game not found' });
            }

            console.log('Juego original:', originalGame._doc);

            const updatedGame = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedGame) {
                return res.status(404).send({ message: 'Update failed' });
            }

            console.log('Juego actualizado:', updatedGame._doc);

            let changedField = null;
            for (const field in updatedGame._doc) {
                if (updatedGame._doc[field] !== originalGame._doc[field]) {
                    changedField = field;
                    break;
                }
            }

            notifyClients(updatedGame, modelType, changedField);
            res.send(updatedGame);
        } catch (err) {
            console.error('Error al actualizar el juego:', err);
            res.status(400).send({ error: err.message });
        }
    };

    return router;
};
