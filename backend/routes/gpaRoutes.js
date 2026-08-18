const express = require('express');
const router = express.Router();
const gpaController = require('../controllers/gpaController');
const protect = require('../middlewares/auth');

router.get('/', protect, gpaController.getGpaData);
router.post('/project', protect, gpaController.calculateProjection);

module.exports = router;
