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
router.get('/:moduleId/sessions', auth, chatController.getSessions);
router.post('/:moduleId/sessions', auth, chatController.createSession);
router.get('/:moduleId/sessions/:sessionId/chat', auth, chatController.getChatHistory);
router.post('/:moduleId/sessions/:sessionId/chat', auth, chatController.addMessage);
router.delete('/:moduleId/sessions/:sessionId', auth, chatController.deleteSession);

module.exports = router;