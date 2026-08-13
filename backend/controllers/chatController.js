const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get chat history for a module
exports.getChatHistory = async (req, res) => {
  try {
    const { moduleId } = req.params;

    // Verify module belongs to user
    const module = await prisma.module.findFirst({
      where: { id: moduleId, userId: req.user.id }
    });

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { moduleId },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Save a new chat message
exports.saveMessage = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { role, content, sources } = req.body;

    if (!role || !content) {
      return res.status(400).json({ message: 'Role and content are required' });
    }

    // Verify module belongs to user
    const module = await prisma.module.findFirst({
      where: { id: moduleId, userId: req.user.id }
    });

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const message = await prisma.chatMessage.create({
      data: {
        role,
        content,
        sources: sources || null,
        moduleId
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Save chat message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
