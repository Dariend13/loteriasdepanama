const mongoose = require('mongoose');

const MonazoGameSchema = new mongoose.Schema({
    fecha: {
        type: Date,
        required: true
    },
    numeroSorteo: {
        type: String,
        required: true
    },
    dia: {
        type: String,
    },
    hora:{
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

const MonazoGame = mongoose.model( 'MonazoGame', MonazoGameSchema);

module.exports = MonazoGame;
