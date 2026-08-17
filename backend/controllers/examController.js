const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all exams for the user
exports.getExams = async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      where: { userId: req.user.id },
      include: {
        module: {
          select: { moduleName: true, moduleCode: true }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    res.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Server error fetching exams' });
  }
};

// Create a new exam
exports.createExam = async (req, res) => {
  try {
    const { title, date, location, moduleId } = req.body;
    const newExam = await prisma.exam.create({
      data: {
        title,
        date: new Date(date),
        location,
        moduleId: moduleId || null,
        userId: req.user.id
      }
    });
    res.status(201).json(newExam);
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ message: 'Server error creating exam' });
  }
};

// Update an exam
exports.updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure it belongs to user
    const exam = await prisma.exam.findFirst({
      where: { id, userId: req.user.id }
    });
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const { title, date, location, moduleId } = req.body;
    
    const updated = await prisma.exam.update({
      where: { id },
      data: {
        title,
        date: date ? new Date(date) : undefined,
        location,
        moduleId: moduleId !== undefined ? (moduleId || null) : undefined
      }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ message: 'Server error updating exam' });
  }
};

// Delete an exam
exports.deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure it belongs to user
    const exam = await prisma.exam.findFirst({
      where: { id, userId: req.user.id }
    });
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    await prisma.exam.delete({
      where: { id }
    });
    
    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ message: 'Server error deleting exam' });
  }
};
