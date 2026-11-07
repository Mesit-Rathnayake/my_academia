const prisma = require('../prismaClient');
const GpaEngine = require('../services/gpaEngine');

exports.getGpaData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user with university config
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        universityConfig: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let config = user.universityConfig;
    if (!config) {
      config = await prisma.universityConfig.findFirst();
      if (config) {
        await prisma.user.update({
          where: { id: userId },
          data: { universityConfigId: config.id }
        });
      }
    }

    if (!config) {
      return res.status(400).json({ error: 'User does not have an assigned university config.' });
    }

    // Fetch all modules with their results
    const modules = await prisma.module.findMany({
      where: { userId },
      include: {
        moduleResults: true
      }
    });

    // Run through the engine
    const engine = new GpaEngine(config);
    const performance = engine.calculatePerformance(modules);

    res.json(performance);

  } catch (error) {
    console.error('Error calculating GPA:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.calculateProjection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetGpa, totalDegreeCredits } = req.body;

    if (!targetGpa || !totalDegreeCredits) {
       return res.status(400).json({ error: 'Missing targetGpa or totalDegreeCredits' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { universityConfig: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let config = user.universityConfig;
    if (!config) {
      config = await prisma.universityConfig.findFirst();
      if (config) {
        await prisma.user.update({
          where: { id: userId },
          data: { universityConfigId: config.id }
        });
      }
    }

    if (!config) {
      return res.status(400).json({ error: 'No config found' });
    }

    const modules = await prisma.module.findMany({
      where: { userId },
      include: { moduleResults: true }
    });

    const engine = new GpaEngine(config);
    const performance = engine.calculatePerformance(modules);
    
    const requiredAverage = engine.calculateProjection(performance, parseFloat(targetGpa), parseInt(totalDegreeCredits, 10));

    res.json({
      targetGpa,
      totalDegreeCredits,
      completedCredits: performance.totalCountedCredits,
      requiredAverage,
      isPossible: requiredAverage !== null && requiredAverage <= config.gpaScale
    });

  } catch (error) {
    console.error('Error calculating projection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
