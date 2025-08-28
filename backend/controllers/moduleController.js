const Module = require('../models/Module');

exports.createModule = async (req, res) => {
  try {
    const { moduleName, moduleCode, lectureHours, attendedHours } = req.body;

    // Validation - Check for required fields
    if (!moduleName || !moduleCode) {
      return res.status(400).json({ 
        message: 'Module name and code are required' 
      });
    }

    // Validation - Check if module code already exists for this user
    const existingModule = await Module.findOne({ 
      moduleCode, 
      user: req.user._id 
    });
    
    if (existingModule) {
      return res.status(400).json({ 
        message: 'Module code already exists for this user' 
      });
    }

    // Create module
    const module = new Module({
      moduleName,
      moduleCode,
      lectureHours: lectureHours || 0,
      attendedHours: attendedHours || 0,
      user: req.user._id
    });

    await module.save();
    res.status(201).json(module);
  } catch (error) {
    console.error('Module creation error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Module code already exists' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.getAllModules = async (req, res) => {
  try {
    const modules = await Module.find({ user: req.user._id });
    res.json(modules);
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// controllers/moduleController.js - Add these methods

exports.getModule = async (req, res) => {
  try {
    const module = await Module.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    res.json(module);
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const { moduleName, moduleCode, lectureHours, attendedHours } = req.body;
    
    const module = await Module.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { moduleName, moduleCode, lectureHours, attendedHours },
      { new: true, runValidators: true }
    );
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    res.json(module);
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};