const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/', examController.getExams);
router.post('/', examController.createExam);
router.put('/:id', examController.updateExam);
router.delete('/:id', examController.deleteExam);

module.exports = router;
