const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
  moduleName: {
    type: String,
    required: [true, 'Module name is required'],
    trim: true,
    maxlength: [100, 'Module name cannot exceed 100 characters']
  },
  moduleCode: {
    type: String,
    required: [true, 'Module code is required'],
    trim: true,
    uppercase: true,
    maxlength: [20, 'Module code cannot exceed 20 characters']
  },
  lectureHours: {
    type: Number,
    default: 0,
    min: [0, 'Lecture hours cannot be negative']
  },
  attendedHours: {
    type: Number,
    default: 0,
    min: [0, 'Attended hours cannot be negative']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true,
  // Add compound index to prevent duplicate module codes per user
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure unique module codes per user
ModuleSchema.index({ moduleCode: 1, user: 1 }, { unique: true });

// Virtual for attendance percentage
ModuleSchema.virtual('attendancePercentage').get(function() {
  if (this.lectureHours === 0) return 0;
  return Math.round((this.attendedHours / this.lectureHours) * 100);
});

module.exports = mongoose.model('Module', ModuleSchema);