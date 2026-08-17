const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all timetable entries for the logged-in user
exports.getTimetable = async (req, res) => {
  try {
    const entries = await prisma.timetableEntry.findMany({
      where: { userId: req.user.id },
      include: {
        module: {
          select: { moduleName: true, moduleCode: true }
        }
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ message: 'Server error fetching timetable' });
  }
};

// Create a new timetable entry
exports.createEntry = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, type, location, moduleId } = req.body;
    const newEntry = await prisma.timetableEntry.create({
      data: {
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        type,
        location,
        moduleId: moduleId || null,
        userId: req.user.id
      }
    });
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error creating timetable entry:', error);
    res.status(500).json({ message: 'Server error creating entry' });
  }
};

// Update an existing entry
exports.updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure the entry belongs to the user
    const entry = await prisma.timetableEntry.findFirst({
      where: { id, userId: req.user.id }
    });
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    const { dayOfWeek, startTime, endTime, type, location, moduleId } = req.body;
    
    const updated = await prisma.timetableEntry.update({
      where: { id },
      data: {
        dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek) : undefined,
        startTime,
        endTime,
        type,
        location,
        moduleId: moduleId !== undefined ? (moduleId || null) : undefined
      }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating timetable entry:', error);
    res.status(500).json({ message: 'Server error updating entry' });
  }
};

// Delete an entry
exports.deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure the entry belongs to the user
    const entry = await prisma.timetableEntry.findFirst({
      where: { id, userId: req.user.id }
    });
    
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    await prisma.timetableEntry.delete({
      where: { id }
    });
    
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting timetable entry:', error);
    res.status(500).json({ message: 'Server error deleting entry' });
  }
};
