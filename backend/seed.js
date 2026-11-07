require('dotenv').config();
const prisma = require('./prismaClient');
const bcrypt = require('bcryptjs');
const GpaEngine = require('./services/gpaEngine');

const ruhunaGradingScale = [
  { grade: "A+", minMarks: 85, maxMarks: 100, gpv: 4.0 },
  { grade: "A", minMarks: 75, maxMarks: 84, gpv: 4.0 },
  { grade: "A-", minMarks: 70, maxMarks: 74, gpv: 3.7 },
  { grade: "B+", minMarks: 65, maxMarks: 69, gpv: 3.3 },
  { grade: "B", minMarks: 60, maxMarks: 64, gpv: 3.0 },
  { grade: "B-", minMarks: 55, maxMarks: 59, gpv: 2.7 },
  { grade: "C+", minMarks: 50, maxMarks: 54, gpv: 2.3 },
  { grade: "C", minMarks: 45, maxMarks: 49, gpv: 2.0 },
  { grade: "C-", minMarks: 40, maxMarks: 44, gpv: 1.7 },
  { grade: "E", minMarks: 0, maxMarks: 39, gpv: 0.0 }
];

const ruhunaClassificationRules = [
  { classification: "First Class", minGpa: 3.70 },
  { classification: "Second Class Upper Division", minGpa: 3.30 },
  { classification: "Second Class Lower Division", minGpa: 3.00 },
  { classification: "No Second Class classification", minGpa: 2.00 }
];

const specialGrades = ["MC", "AC", "WH", "H", "M", "S", "Not Given"];

const defaultModules = [
  // Semester 1
  { semester: 1, moduleCode: "CE1101", moduleName: "Basic Concepts of Environmental Engineering", grade: "B-" },
  { semester: 1, moduleCode: "CE1202", moduleName: "Introduction to Infrastructure Planning", grade: "B" },
  { semester: 1, moduleCode: "EE1301", moduleName: "Fundamentals of Electricity", grade: "B" },
  { semester: 1, moduleCode: "EE1102", moduleName: "Programming Fundamentals", grade: "B-" },
  { semester: 1, moduleCode: "ME1201", moduleName: "Engineering Drawing", grade: "A" },
  { semester: 1, moduleCode: "ME1202", moduleName: "Fundamentals of Thermodynamics", grade: "B" },
  { semester: 1, moduleCode: "IS1301", moduleName: "Communication for Engineers", grade: "A-" },
  { semester: 1, moduleCode: "IS1402", moduleName: "Mathematical Fundamentals for Engineers", grade: "B-" },

  // Semester 2
  { semester: 2, moduleCode: "CE2201", moduleName: "Fundamentals of Fluid Mechanics", grade: "C+" },
  { semester: 2, moduleCode: "CE2302", moduleName: "Mechanics of Materials", grade: "B" },
  { semester: 2, moduleCode: "EE2201", moduleName: "Fundamentals of Electronics", grade: "B" },
  { semester: 2, moduleCode: "EE2202", moduleName: "Object Oriented Programming", grade: "B-" },
  { semester: 2, moduleCode: "ME2201", moduleName: "Engineering Mechanics", grade: "B" },
  { semester: 2, moduleCode: "ME2302", moduleName: "Fundamentals of Materials and Manufacturing Engineering", grade: "A" },
  { semester: 2, moduleCode: "IS2401", moduleName: "Name Doesn't Matter", grade: "C" },

  // Semester 3
  { semester: 3, moduleCode: "EC3305", moduleName: "Signal and Systems", grade: "B+" },
  { semester: 3, moduleCode: "EC3301", moduleName: "Analog Electronics", grade: "B-" },
  { semester: 3, moduleCode: "IS3301", moduleName: "Mathematical Transforms", grade: "B" },
  { semester: 3, moduleCode: "EC3202", moduleName: "Data Structures And Algorithms", grade: "A-" },
  { semester: 3, moduleCode: "EC3203", moduleName: "Electrical and Electronic Measurements", grade: "A-" },
  { semester: 3, moduleCode: "EC3404", moduleName: "GUI Programming", grade: "A+" },

  // Semester 4
  { semester: 4, moduleCode: "EC4201", moduleName: "Advanced Data Structures and Algorithms", grade: "B+" },
  { semester: 4, moduleCode: "EC4202", moduleName: "Computer Architecture", grade: "C+" },
  { semester: 4, moduleCode: "EC4203", moduleName: "Database Systems", grade: "C+" },
  { semester: 4, moduleCode: "EC4205", moduleName: "Software Engineering Principles", grade: "A" },
  { semester: 4, moduleCode: "EC4206", moduleName: "Software Testing and Quality Assurance", grade: "B+" },
  { semester: 4, moduleCode: "EC4304", moduleName: "Digital Logic Design", grade: "B" },
  { semester: 4, moduleCode: "EC4307", moduleName: "Web Application Development", grade: "B+" },
  { semester: 4, moduleCode: "IS4301", moduleName: "Probability and Statistics", grade: "C+" },

  // Semester 6
  { semester: 6, moduleCode: "IS6303", moduleName: "Numerical Methods", grade: "B+" },
  { semester: 6, moduleCode: "IS6102", moduleName: "Engineering Ethics", grade: "A-" }
];

async function main() {
  console.log('Seeding University Config...');

  const ruhunaConfig = await prisma.universityConfig.upsert({
    where: { name: 'University of Ruhuna - Engineering' },
    update: {
      gradingScale: ruhunaGradingScale,
      classificationRules: ruhunaClassificationRules,
      specialGrades: specialGrades
    },
    create: {
      name: 'University of Ruhuna - Engineering',
      gpaScale: 4.0,
      rounding: 2,
      creditRule: 'SECOND_DIGIT_OF_MODULE_CODE',
      gradingScale: ruhunaGradingScale,
      classificationRules: ruhunaClassificationRules,
      specialGrades: specialGrades
    }
  });

  console.log('Successfully seeded University of Ruhuna config.');

  const seedPassword = process.env.SEED_USER_PASSWORD;
  if (!seedPassword) {
    console.log('SEED_USER_PASSWORD not set in .env; skipping user account seed.');
    return;
  }

  const hashedPassword = await bcrypt.hash(seedPassword, 10);
  const user = await prisma.user.upsert({
    where: { registrationNumber: 'EG/2022/5440' },
    update: {
      firstName: 'Mesith',
      lastName: 'Rathnayake',
      password: hashedPassword,
      universityConfigId: ruhunaConfig.id
    },
    create: {
      registrationNumber: 'EG/2022/5440',
      firstName: 'Mesith',
      lastName: 'Rathnayake',
      password: hashedPassword,
      universityConfigId: ruhunaConfig.id
    }
  });

  console.log(`Seeded user: ${user.firstName} ${user.lastName} (${user.registrationNumber})`);

  for (const mod of defaultModules) {
    const existingModule = await prisma.module.findUnique({
      where: {
        moduleCode_userId: {
          moduleCode: mod.moduleCode,
          userId: user.id
        }
      }
    });

    if (existingModule) {
      await prisma.module.update({
        where: { id: existingModule.id },
        data: {
          moduleName: mod.moduleName,
          semester: mod.semester,
          isGpaCounted: true,
          moduleResults: {
            deleteMany: {},
            create: [
              {
                attemptNumber: 1,
                grade: mod.grade,
                isProperAttempt: true
              }
            ]
          }
        }
      });
    } else {
      await prisma.module.create({
        data: {
          moduleCode: mod.moduleCode,
          moduleName: mod.moduleName,
          semester: mod.semester,
          isGpaCounted: true,
          userId: user.id,
          moduleResults: {
            create: [
              {
                attemptNumber: 1,
                grade: mod.grade,
                isProperAttempt: true
              }
            ]
          }
        }
      });
    }
  }

  console.log(`Seeded ${defaultModules.length} modules with results across Semesters 1, 2, 3, 4, and 6.`);

  await prisma.user.updateMany({
    where: { universityConfigId: null },
    data: { universityConfigId: ruhunaConfig.id }
  });

  const allUserModules = await prisma.module.findMany({
    where: { userId: user.id },
    include: { moduleResults: true }
  });
  const engine = new GpaEngine(ruhunaConfig);
  const perf = engine.calculatePerformance(allUserModules);
  console.log('\n--- GPA Summary for EG/2022/5440 ---');
  for (const [sem, data] of Object.entries(perf.sgpas)) {
    console.log(`Semester ${sem}: SGPA = ${data.sgpa?.toFixed(2)} (${data.credits} Credits, ${data.weightedGp.toFixed(1)} GP)`);
  }
  console.log(`Overall OGPA: ${perf.ogpa?.toFixed(2)} | Total Credits: ${perf.totalCountedCredits} | Classification: ${perf.classification}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
