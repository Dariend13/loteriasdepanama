const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    tipoSorteo: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
        enum: ['Miercolito', 'Gordito', 'Dominical']
    },
    fecha: {
        type: Date,
        required: true
    },
    letras: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    numeroSorteo: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    primerPremio: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    lugaresVendidosPrimerPremio: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    segundoPremio: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    lugaresVendidosSegundoPremio: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    tercerPremio: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    lugaresVendidosTercerPremio: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    serie: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    folio: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed'],
        default: 'in-progress'
    }
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
