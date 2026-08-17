const express = require('express');
const router = express.Router();
const examSeriesController = require('../controllers/examSeriesController');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/', examSeriesController.getExamSeries);
router.post('/', examSeriesController.createExamSeries);
router.delete('/:id', examSeriesController.deleteExamSeries);

module.exports = router;
