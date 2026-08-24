const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all exam series for the user
exports.getExamSeries = async (req, res) => {
  try {
    const series = await prisma.examSeries.findMany({
      where: { userId: req.user.id },
      include: {
        exams: {
          orderBy: {
            date: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // or could order by the earliest exam date
      }
    });
    res.json(series);
  } catch (error) {
    console.error('Error fetching exam series:', error);
    res.status(500).json({ message: 'Server error fetching exam series' });
  }
};

// Create a new exam series with child exams
exports.createExamSeries = async (req, res) => {
  try {
    const { title, exams } = req.body;
    
    if (!title || !exams || !Array.isArray(exams) || exams.length === 0) {
      return res.status(400).json({ message: 'Title and at least one exam are required' });
    }

    const newSeries = await prisma.examSeries.create({
      data: {
        title,
        userId: req.user.id,
        exams: {
          create: exams.map(exam => ({
            title: exam.title,
            date: new Date(exam.date),
            location: exam.location || null,
            userId: req.user.id
          }))
        }
      },
      include: {
        exams: true
      }
    });

    res.status(201).json(newSeries);
  } catch (error) {
    console.error('Error creating exam series:', error);
    res.status(500).json({ message: 'Server error creating exam series' });
  }
};

// Delete an exam series (cascades to exams)
exports.deleteExamSeries = async (req, res) => {
  try {
    const { id } = req.params;
    
    const series = await prisma.examSeries.findFirst({
      where: { id, userId: req.user.id }
    });
    
    if (!series) {
      return res.status(404).json({ message: 'Exam series not found' });
    }

    await prisma.examSeries.delete({
      where: { id }
    });
    
    res.json({ message: 'Exam series deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam series:', error);
    res.status(500).json({ message: 'Server error deleting exam series' });
  }
};

// Update an exam series and its exams
exports.updateExamSeries = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, exams } = req.body;

    const existing = await prisma.examSeries.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Exam series not found' });
    }

    // Delete previous exams of this series and recreate updated list
    if (exams && Array.isArray(exams)) {
      await prisma.exam.deleteMany({
        where: { examSeriesId: id }
      });
    }

    const updated = await prisma.examSeries.update({
      where: { id },
      data: {
        title: title || existing.title,
        ...(exams && Array.isArray(exams) && {
          exams: {
            create: exams.map(exam => ({
              title: exam.title || exam.subject || 'Subject Exam',
              date: new Date(exam.date || exam.dateTime),
              location: exam.location || null,
              userId: req.user.id
            }))
          }
        })
      },
      include: {
        exams: true
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating exam series:', error);
    res.status(500).json({ message: 'Server error updating exam series' });
  }
};
