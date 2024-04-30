const express = require('express');
const moment = require('moment');
const Game = require('../models/Game');
const TicaGame = require('../models/TicaGame');
const MonazoGame = require('../models/MonazoGame');
const passport = require('../config/passport');
const WebSocket = require('ws');

module.exports = function (wss) {
    const router = express.Router();

    //Juegos por semana para app
    const moment = require('moment');
    const momenttime = require('moment-timezone');
    const expectedFields = ['serie', 'folio', 'letras', 'primerPremio', 'segundoPremio', 'tercerPremio', 'lugaresVendidosPrimerPremio', 'lugaresVendidosSegundoPremio', 'lugaresVendidosTercerPremio'];
    const expectedFieldsTica = ['primerPremio', 'segundoPremio', 'tercerPremio'];

    router.get('/gamesOfWeek', async (req, res) => {
        try {
            // Buscar los últimos 5 juegos ordenados por fecha en orden descendente
            const games = await Game.find()
                .sort({ fecha: -1 }) // Ordenar por fecha en orden descendente
                .limit(5); // Limitar a 5 resultados

            // Si prefieres formatear las fechas, puedes hacerlo aquí
            const formattedGames = games.map(game => ({
                ...game._doc,
                fecha: formatDate(game.fecha)
            }));

            res.send(formattedGames);
        } catch (err) {
            console.error('Error al obtener los últimos 5 juegos:', err);
            res.status(500).send({ error: err.message });
        }
    });

    // Obtener todos los juegos
    router.get('/list', async (req, res) => {
        try {
            const games = await Game.find();
            res.send(games);
        } catch (err) {
            res.status(500).send({ error: err.message });
        }
    });

    // Obtener el último juego completado
    router.get('/latest', async (req, res) => {
        try {
            const latestCompletedGame = await Game.findOne({ status: 'completed' }).sort({ fecha: -1 });
            if (latestCompletedGame) {
                res.send(latestCompletedGame);
            } else {
                res.status(404).send({ message: 'No completed games found' });
            }
        } catch (err) {
            res.status(500).send({ error: err.message });
        }
    });


    //Obtener juegos segun busqueda
    router.get('/games', passport.authenticate('jwt', { session: false }), async (req, res) => {
        const { month, year } = req.query;

        try {
            const numericMonth = parseInt(month, 10);
            const numericYear = parseInt(year, 10);

            console.log("Buscando juegos para el mes:", numericMonth, "y año:", numericYear);
            let games = [];
            if (!isNaN(numericMonth) && !isNaN(numericYear)) {
                const startDate = new Date(Date.UTC(numericYear, numericMonth - 1, 1));
                const endDate = new Date(Date.UTC(numericYear, numericMonth, 1));

                games = await Game.find({
                    fecha: {
                        $gte: startDate,
                        $lt: endDate
                    }
                });
            } else {
                games = await Game.find();
            }
            res.send(games);
        } catch (err) {
            console.error('Error al obtener los juegos:', err);
            res.status(500).send({ error: err.message });
        }
    });


    const formatDate = (date) => {
        if (!date) date = new Date();

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    router.get('/listinprogress', async (req, res) => {
        try {
            const games = await Game.find({ status: 'in-progress' });  // Filtrar por status 'in-progress'

            // Formatear las fechas de los juegos antes de enviar la respuesta
            const formattedGames = games.map(game => ({
                ...game._doc,  // Esto copia todos los campos del juego
                fecha: formatDate(game.fecha)
            }));

            res.send(formattedGames);
        } catch (err) {
            res.status(500).send({ error: err.message });
        }
    });

    // Agregar un nuevo juego
    router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
        console.log('Datos recibidos:', req.body);
        try {
            console.log('Datos recibidos formateado:', req.body);
            const game = new Game(req.body);
            await game.save();

            // Formatear la fecha antes de enviarla a los clientes de WebSocket
            const gameToSend = {
                ...game._doc,
                fecha: formatDate(game.fecha)
            };

            // Enviar el juego formateado a los clientes de WebSocket
            wss.clients.forEach(client => {
                client.send(JSON.stringify({
                    type: 'NEW_GAME_ADDED',
                    data: gameToSend
                }));
            });

            res.status(201).send(game);
        } catch (err) {
            console.error('Error al guardar el juego:', err);
            res.status(400).send({ error: err.message });
        }
    });

    // Actualizar un juego
    router.put('/update/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
        delete req.body._id;

        console.log('Datos recibidos:', req.body); // 1. Ver los datos recibidos

        if (req.body.fecha === null) {
            req.body.fecha = momenttime.tz("America/Panama").startOf('day').toDate();
        }

        try {
            const originalGame = await Game.findById(req.params.id);
            if (!originalGame) {
                return res.status(404).send({ message: 'Game not found' });
            }

            console.log('Juego original:', originalGame._doc); // 2. Ver el juego original

            const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedGame) {
                return res.status(404).send({ message: 'Update failed' });
            }

            console.log('Juego actualizado:', updatedGame._doc); // 3. Ver el juego actualizado

            let changedField = null;
            for (const field of expectedFields) {
                if (updatedGame._doc[field] !== originalGame._doc[field]) {
                    changedField = field;
                    break;
                }
            }

            notifyClients(updatedGame, changedField);

            res.send(updatedGame);
        } catch (err) {
            res.status(400).send({ error: err.message });
        }
    });

    const notifyClients = (game, changedField) => {
        const formattedGame = {
            ...game._doc,
            fecha: formatDate(game.fecha)
        };

        console.log('Notificando a clientes:', formattedGame, 'Campo cambiado:', changedField); // 4. Ver qué se está enviando a los clientes

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'updateGame',
                    game: formattedGame,
                    changedField: changedField
                }));
            }
        });
    };

    router.put('/complete/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
        try {
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

    //----------------------------------------JUEGOS DE MONAZO  ---------------------------------------
    // Agregar un nuevo juego de Monazo
    router.post('/monazo', passport.authenticate('jwt', { session: false }), async (req, res) => {
        try {
            const game = new MonazoGame(req.body);
            await game.save();

            // Formatear la fecha antes de enviarla a los clientes del Websocket
            const gameToSend = {
                ...game._doc,
                fecha: formatDate(game.fecha)
            };

            // Enviar el juego formateado a los clientes del WebSocket
            wss.clients.forEach(cliente => {
                client.send(JSON.stringify({
                    type: 'NEW_MONAZO_ADDED',
                    data: gameToSend
                }));
            })
        } catch (err) {
            console.error('Error al guardar el juego de Monazo:', err);
            res.status(400).send({ error: err.message });
        }
    });

    // Actualizar un juego de Monazo
    router.put('/update/monazo/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
        delete req.body._id;

        console.log('Datos recibidos para Monazo', req.body);

        if (req.body.fecha === null) {
            req.body.fecha = momenttime.tz("America/Panama").startOf('day').toDate();
        }

    try {
        console.log("Buscando juego con ID:", req.params.id);
        const originalGame = await MonazoGame.findById(req.params.id);
        console.log("Juego encontrado:", originalGame);
        if (!originalGame) {
            return res.status(404).send({ nessage: 'Game not found' });
        }
        console.log('Juego original de La Tica:', originalGame._doc); // 2. Ver el juego original

        const updatedGame = await MonazoGame.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedGame) {
            return res.status(404).send({ message: 'Update failed' });
        }

        console.log('Juego actualizado de La Tica:', updatedGame._doc); // 3. Ver el juego actualizado

        let changedField = null;
        for (const field of expectedFieldsTica) {
            if (updatedGame._doc[field] !== originalGame._doc[field]) {
                changedField = field;
                break;
            }
        }

        notifyClients(updatedGame, changedField);

        res.send(updatedGame);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

router.put('/complete/monazo/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const game = await MonazoGame.findById(req.params.id);

        if (!game) {
            return res.status(404).send({ success: false, message: 'Game not found' });
        }

        game.status = 'completed';
        await game.save();
        res.send({ success: true, game: game });
    } catch (err) {
        res.status(400).send({ success: false, error: err.message });
    }
});

// Obtener todos los juegos de Monazo
router.get('/monazolist', async (req, res) => {
    try {
        const games = await MonazoGame.find();
        res.send(games);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Solo Juegos de Monazo en estado 'in-progress'
router.get('/monazo/listinprogress', async (req, res) => {
    try {
        const games = await MonazoGame.find({ status: 'in-progress' });  // Filtrar por status 'in-progress'

        // Formatear las fechas de los juegos antes de enviar la respuesta
        const formattedGames = games.map(game => ({
            ...game._doc,  // Esto copia todos los campos del juego
            fecha: formatDate(game.fecha)
        }));

        res.send(formattedGames);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

router.get('/monazo/gamesOfWeek', async (req, res) => {
    try {
        // Buscar los últimos 5 juegos ordenados por fecha en orden descendente
        const games = await MonazoGame.find()
            .sort({ fecha: -1 }) // Ordenar por fecha en orden descendente
            .limit(5); // Limitar a 5 resultados

        // Formatear las fechas de los juegos antes de enviar la respuesta
        const formattedGames = games.map(game => ({
            ...game._doc,
            fecha: formatDate(game.fecha)
        }));

        res.send(formattedGames);
    } catch (err) {
        console.error('Error al obtener los últimos 5 juegos de Monazo:', err);
        res.status(500).send({ error: err.message });
    }
});

//----------------------------------------JUEGOS DE LA TICA  ---------------------------------------
// Agregar un nuevo juego de Tica
router.post('/tica', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const game = new TicaGame(req.body);
        await game.save();

        // Formatear la fecha antes de enviarla a los clientes de WebSocket
        const gameToSend = {
            ...game._doc,
            fecha: formatDate(game.fecha)
        };

        // Enviar el juego formateado a los clientes de WebSocket
        wss.clients.forEach(client => {
            client.send(JSON.stringify({
                type: 'NEW_TICA_ADDED',
                data: gameToSend
            }));
        });

        res.status(201).send(game);
    } catch (err) {
        console.error('Error al guardar el juego de Tica:', err);
        res.status(400).send({ error: err.message });
    }
});

// Actualizar un juego de La Tica
router.put('/update/tica/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    delete req.body._id;

    console.log('Datos recibidos para La Tica:', req.body); // 1. Ver los datos recibidos

    if (req.body.fecha === null) {
        req.body.fecha = momenttime.tz("America/Panama").startOf('day').toDate();
    }

    try {
        console.log("Buscando juego con ID:", req.params.id);
        const originalGame = await TicaGame.findById(req.params.id);
        console.log("Juego encontrado:", originalGame);
        if (!originalGame) {
            return res.status(404).send({ message: 'Game not found' });
        }

        console.log('Juego original de La Tica:', originalGame._doc); // 2. Ver el juego original

        const updatedGame = await TicaGame.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedGame) {
            return res.status(404).send({ message: 'Update failed' });
        }

        console.log('Juego actualizado de La Tica:', updatedGame._doc); // 3. Ver el juego actualizado

        let changedField = null;
        for (const field of expectedFieldsTica) {
            if (updatedGame._doc[field] !== originalGame._doc[field]) {
                changedField = field;
                break;
            }
        }

        notifyClients(updatedGame, changedField);

        res.send(updatedGame);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

router.put('/complete/tica/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const game = await TicaGame.findById(req.params.id);

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


// Obtener todos los juegos
router.get('/ticalist', async (req, res) => {
    try {
        const games = await TicaGame.find();
        res.send(games);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

//Solo Juegos en estado 'in-progress'
router.get('/tica/listinprogress', async (req, res) => {
    try {
        const games = await TicaGame.find({ status: 'in-progress' });  // Filtrar por status 'in-progress'

        // Formatear las fechas de los juegos antes de enviar la respuesta
        const formattedGames = games.map(game => ({
            ...game._doc,  // Esto copia todos los campos del juego
            fecha: formatDate(game.fecha)
        }));

        res.send(formattedGames);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

router.get('/tica/gamesOfWeek', async (req, res) => {
    try {
        // Buscar los últimos 5 juegos ordenados por fecha en orden descendente
        const games = await TicaGame.find()
            .sort({ fecha: -1 }) // Ordenar por fecha en orden descendente
            .limit(5); // Limitar a 5 resultados

        // Formatear las fechas de los juegos antes de enviar la respuesta
        const formattedGames = games.map(game => ({
            ...game._doc,
            fecha: formatDate(game.fecha)
        }));

        res.send(formattedGames);
    } catch (err) {
        console.error('Error al obtener los últimos 5 juegos de Tica:', err);
        res.status(500).send({ error: err.message });
    }
});
return router;
};