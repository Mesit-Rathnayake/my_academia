const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  marks: {
    type: Number,
    default: null
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);