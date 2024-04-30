const mongoose = require('mongoose');

const ticaGameSchema = new mongoose.Schema({
    fecha: {
        type: Date,
        required: true
    },
    dia: {
        type: String,
        required: true
    },
    numeroSorteo: {
        type: String,
        required: true
    },
    primerPremio: {
        type: String,
        required: true,
    },
    segundoPremio: {
        type: String,
        required: true,
    },
    tercerPremio: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed'],
        default: 'in-progress'
    }
});

const TicaGame = mongoose.model('TicaGame', ticaGameSchema);

module.exports = TicaGame;
