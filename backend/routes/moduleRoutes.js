// routes/moduleRoutes.js
const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const documentController = require('../controllers/documentController');
const auth = require('../middlewares/auth');
const multer = require('multer');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: 'uploads/' });

// Protect all routes
router.use(auth);

// Module CRUD
router.get('/', moduleController.getAllModules);
router.post('/', moduleController.createModule);
router.get('/:id', moduleController.getModule);
router.put('/:id', moduleController.updateModule);
router.delete('/:id', moduleController.deleteModule);

// Document routes
router.post('/:moduleId/documents', upload.single('file'), documentController.uploadDocument);
router.delete('/:moduleId/documents/:documentId', documentController.deleteDocument);

// Chat routes
const chatController = require('../controllers/chatController');
router.get('/:moduleId/chat', chatController.getChatHistory);
router.post('/:moduleId/chat', chatController.saveMessage);

module.exports = router;