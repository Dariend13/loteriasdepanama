const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true
  },
  inventoryNumber: {
    type: String,
    required: true,
    unique: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['Excelente', 'Bueno', 'Decente', 'Malo'],
    default: 'Bueno'
  },
  description: {
    type: String,
    required: true
  },
  additionalInformation: {
    type: String
  },
  images: [{
    type: String
  }],
  notes: {
    type: String
  }
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;
