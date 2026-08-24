const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const path = require('path');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

exports.uploadDocument = async (req, res) => {
  try {
    const moduleId = req.params.moduleId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // 1. Verify module exists and belongs to user
    const module = await prisma.module.findFirst({
      where: { id: moduleId, userId: req.user.id }
    });

    if (!module) {
      // Clean up the uploaded file
      fs.unlinkSync(file.path);
      return res.status(404).json({ message: 'Module not found' });
    }

    // 2. Save document record to DB
    const document = await prisma.document.create({
      data: {
        name: file.originalname,
        filepath: file.path,
        moduleId: moduleId
      }
    });

    // 3. Forward the document to the AI Service for indexing
    try {
      const formData = new FormData();
      formData.append('user_id', req.user.id);
      formData.append('module_id', moduleId);
      formData.append('document_id', document.id);
      formData.append('file', fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: 'application/pdf'
      });

      console.log(`Forwarding document ${document.id} to AI Service at ${AI_SERVICE_URL}/api/v1/documents/index`);

      const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/v1/documents/index`, formData, {
        headers: {
          ...formData.getHeaders()
        }
      });

      console.log('AI Service response:', aiResponse.data);
      
      res.status(201).json({
        message: 'Document uploaded and indexed successfully',
        document: document,
        aiData: aiResponse.data
      });
      
    } catch (aiError) {
      console.error('Failed to index document in AI Service:', aiError.message);
      if (aiError.response) {
        console.error('AI Service Error Details:', aiError.response.data);
      }
      
      return res.status(500).json({ 
        message: 'Document saved locally, but failed to index in AI Service', 
        error: aiError.response?.data || aiError.message 
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { moduleId, documentId } = req.params;

    // Verify ownership
    const module = await prisma.module.findFirst({
      where: { id: moduleId, userId: req.user.id }
    });

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const document = await prisma.document.findFirst({
      where: { id: documentId, moduleId: moduleId }
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete from DB
    await prisma.document.delete({ where: { id: documentId } });

    // Delete physical file
    if (fs.existsSync(document.filepath)) {
      fs.unlinkSync(document.filepath);
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDocument = async (req, res) => {
  try {
    const { moduleId, documentId } = req.params;
    const document = await prisma.document.findFirst({
      where: { id: documentId, moduleId: moduleId }
    });

    if (!document || !fs.existsSync(document.filepath)) {
      return res.status(404).json({ message: 'Document file not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.name}"`);
    fs.createReadStream(document.filepath).pipe(res);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
