const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Pega3Schema = new Schema({
    fecha: {
        type: Date,
        required: true
    },
    dia: {
        type: String,
        required: true
    },
    numeroSorteo: {
        type: Number,
        required: true
    },
    numeros: {
        type: [Number],
        validate: [arrayLimit, '{PATH} exceeds the limit of 6 numbers']
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed'],
        default: 'in-progress'
    }
});

function arrayLimit(val) {
  return val.length <= 6;
}

const Pega3 = mongoose.model('Pega3', Pega3Schema);

module.exports = Pega3;
