const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/', timetableController.getTimetable);
router.post('/', timetableController.createEntry);
router.put('/:id', timetableController.updateEntry);
router.delete('/:id', timetableController.deleteEntry);

module.exports = router;
