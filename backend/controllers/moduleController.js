const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to format module object for backwards compatibility with frontend expecting _id
const formatModule = (mod) => ({
  ...mod,
  _id: mod.id,
  attendancePercentage: mod.conductedLectures === 0 ? 0 : Math.round((mod.attendedLectures / mod.conductedLectures) * 100)
});

exports.createModule = async (req, res) => {
  try {
    const { moduleName, moduleCode, totalLectures, conductedLectures, attendedLectures, assignments, labs } = req.body;

    if (!moduleName || !moduleCode) {
      return res.status(400).json({ 
        message: 'Module name and code are required' 
      });
    }

    try {
      const module = await prisma.module.create({
        data: {
          moduleName,
          moduleCode: moduleCode.toUpperCase(),
          totalLectures: totalLectures || 0,
          conductedLectures: conductedLectures || 0,
          attendedLectures: attendedLectures || 0,
          userId: req.user.id,
          assignments: assignments && assignments.length > 0 ? { create: assignments.map(a => ({ name: a.name, marks: a.marks, totalMarks: a.totalMarks, dueDate: a.dueDate ? new Date(a.dueDate) : null, status: a.status })) } : undefined,
          labs: labs && labs.length > 0 ? { create: labs.map(l => ({ name: l.name, marks: l.marks, totalMarks: l.totalMarks, dueDate: l.dueDate ? new Date(l.dueDate) : null, status: l.status })) } : undefined
        },
        include: {
          assignments: { orderBy: { createdAt: 'asc' } },
          labs: { orderBy: { createdAt: 'asc' } },
          documents: { orderBy: { createdAt: 'desc' } }
        }
      });
      res.status(201).json(formatModule(module));
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ 
          message: 'Module code already exists for this user' 
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Module creation error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.getAllModules = async (req, res) => {
  try {
    const modules = await prisma.module.findMany({ 
      where: { userId: req.user.id },
      include: {
        assignments: { orderBy: { createdAt: 'asc' } },
        labs: { orderBy: { createdAt: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } }
      }
    });
    res.json(modules.map(formatModule));
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

exports.getModule = async (req, res) => {
  try {
    const module = await prisma.module.findFirst({ 
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      },
      include: {
        assignments: { orderBy: { createdAt: 'asc' } },
        labs: { orderBy: { createdAt: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } }
      }
    });
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    res.json(formatModule(module));
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const { moduleName, moduleCode, totalLectures, conductedLectures, attendedLectures, assignments, labs } = req.body;
    
    // First verify it exists and belongs to user
    const existing = await prisma.module.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const module = await prisma.module.update({
      where: { id: req.params.id },
      data: { 
        moduleName, 
        moduleCode: moduleCode ? moduleCode.toUpperCase() : undefined, 
        totalLectures,
        conductedLectures,
        attendedLectures,
        // Replace all assignments and labs to sync with frontend arrays
        assignments: assignments ? { deleteMany: {}, create: assignments.map(a => ({ name: a.name, marks: a.marks, totalMarks: a.totalMarks, dueDate: a.dueDate ? new Date(a.dueDate) : null, status: a.status })) } : undefined,
        labs: labs ? { deleteMany: {}, create: labs.map(l => ({ name: l.name, marks: l.marks, totalMarks: l.totalMarks, dueDate: l.dueDate ? new Date(l.dueDate) : null, status: l.status })) } : undefined
      },
      include: {
        assignments: { orderBy: { createdAt: 'asc' } },
        labs: { orderBy: { createdAt: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } }
      }
    });
    
    res.json(formatModule(module));
  } catch (error) {
    console.error('Update module error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Module code already exists for this user' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const existing = await prisma.module.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Module not found' });
    }

    await prisma.module.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};