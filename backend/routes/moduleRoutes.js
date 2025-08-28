// routes/moduleRoutes.js
const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const auth = require('../middlewares/auth');

// Protect all routes
router.use(auth);

// Only include routes that have implemented controllers
router.get('/', moduleController.getAllModules);
router.post('/', moduleController.createModule);
// router.get('/:id', moduleController.getModule); // Remove this line for now
// router.put('/:id', moduleController.updateModule); // Remove this line for now  
// router.delete('/:id', moduleController.deleteModule); // Remove this line for now

module.exports = router;