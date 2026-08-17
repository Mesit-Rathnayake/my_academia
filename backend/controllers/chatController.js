const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all chat sessions for a module
exports.getSessions = async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Verify module belongs to user
    const module = await prisma.module.findFirst({
      where: { id: moduleId, userId: req.user.id }
    });

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const sessions = await prisma.chatSession.findMany({
      where: { moduleId },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new chat session
exports.createSession = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, documentIds } = req.body;

    // Verify module belongs to user
    const module = await prisma.module.findFirst({
      where: { id: moduleId, userId: req.user.id }
    });

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const session = await prisma.chatSession.create({
      data: {
        title: title || 'New Chat',
        documentIds: documentIds || null,
        moduleId
      }
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a session
exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Verify session belongs to user's module
    const session = await prisma.chatSession.findFirst({
      where: { 
        id: sessionId,
        module: { userId: req.user.id } 
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found or access denied' });
    }

    // Delete associated messages first
    await prisma.chatMessage.deleteMany({
      where: { sessionId: sessionId }
    });

    // Delete session
    await prisma.chatSession.delete({
      where: { id: sessionId }
    });

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// Get chat history for a session
exports.getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Verify session belongs to user's module
    const session = await prisma.chatSession.findFirst({
      where: { 
        id: sessionId,
        module: { userId: req.user.id }
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Save a new chat message
exports.addMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { role, content, sources } = req.body;

    if (!role || !content) {
      return res.status(400).json({ message: 'Role and content are required' });
    }

    // Verify session belongs to user's module
    const session = await prisma.chatSession.findFirst({
      where: { 
        id: sessionId,
        module: { userId: req.user.id }
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const message = await prisma.chatMessage.create({
      data: {
        role,
        content,
        sources: sources || null,
        sessionId
      }
    });

    // Update session updatedAt timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Save chat message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Truncate chat from a specific message ID onwards
exports.truncateChat = async (req, res) => {
  try {
    const { sessionId, messageId } = req.params;

    // Verify session belongs to user's module
    const session = await prisma.chatSession.findFirst({
      where: { 
        id: sessionId,
        module: { userId: req.user.id }
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Find the target message
    const targetMessage = await prisma.chatMessage.findUnique({
      where: { id: messageId }
    });

    if (!targetMessage || targetMessage.sessionId !== sessionId) {
      return res.status(404).json({ message: 'Message not found in this session' });
    }

    // Delete all messages in the session created at or after the target message
    const deleted = await prisma.chatMessage.deleteMany({
      where: {
        sessionId: sessionId,
        createdAt: {
          gte: targetMessage.createdAt
        }
      }
    });

    // Update session updatedAt timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    });

    res.json({ message: 'Chat truncated successfully', deletedCount: deleted.count });
  } catch (error) {
    console.error('Truncate chat error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
