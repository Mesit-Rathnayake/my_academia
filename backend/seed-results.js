const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const regNumber = "EG/2022/5440";

const semesterData = [
  // Sem 1
  { sem: 1, name: "Basic Concepts of Environmental Engineering", code: "CE1101", grade: "B-" },
  { sem: 1, name: "Introduction to Infrastructure Planning", code: "CE1202", grade: "B" },
  { sem: 1, name: "Fundamentals of Electricity", code: "EE1301", grade: "B" },
  { sem: 1, name: "Programming Fundamentals", code: "EE1102", grade: "B-" },
  { sem: 1, name: "Engineering Drawing", code: "ME1201", grade: "A" },
  { sem: 1, name: "Fundamentals of Thermodynamics", code: "ME1202", grade: "B" },
  { sem: 1, name: "Communication for Engineers", code: "IS1301", grade: "A-" },
  { sem: 1, name: "Mathematical Fundamentals for Engineers", code: "IS1402", grade: "B-" },

  // Sem 2
  { sem: 2, name: "Fundamentals of Fluid Mechanics", code: "CE2201", grade: "C+" },
  { sem: 2, name: "Mechanics of Materials", code: "CE2302", grade: "B" },
  { sem: 2, name: "Fundamentals of Electronics", code: "EE2201", grade: "B" },
  { sem: 2, name: "Object Oriented Programming", code: "EE2202", grade: "B-" },
  { sem: 2, name: "Engineering Mechanics", code: "ME2201", grade: "B" },
  { sem: 2, name: "Fundamentals of Materials and Manufacturing Engineering", code: "ME2302", grade: "A" },
  { sem: 2, name: "Name Doesn't Matter", code: "IS2401", grade: "C" },

  // Sem 3
  { sem: 3, name: "Signal and Systems", code: "EC3305", grade: "B+" },
  { sem: 3, name: "Analog Electronics", code: "EC3301", grade: "B-" },
  { sem: 3, name: "Mathematical Transforms", code: "IS3301", grade: "B" },
  { sem: 3, name: "Data Structures And Algorithms", code: "EC3202", grade: "A-" },
  { sem: 3, name: "Electrical and Electronic Measurements", code: "EC3203", grade: "A-" },
  { sem: 3, name: "GUI Programming", code: "EC3404", grade: "A+" },

  // Sem 4
  { sem: 4, name: "Advanced Data Structures and Algorithms", code: "EC4201", grade: "Not Given" },
  { sem: 4, name: "Computer Architecture", code: "EC4202", grade: "C+" },
  { sem: 4, name: "Database Systems", code: "EC4203", grade: "C+" },
  { sem: 4, name: "Software Engineering Principles", code: "EC4205", grade: "Not Given" },
  { sem: 4, name: "Software Testing and Quality Assurance", code: "EC4206", grade: "B+" },
  { sem: 4, name: "Digital Logic Design", code: "EC4304", grade: "B" },
  { sem: 4, name: "Web Application Development", code: "EC4307", grade: "B+" },
  { sem: 4, name: "Probability and Statistics", code: "IS4301", grade: "C+" }
];

async function main() {
  // 1. Create or find University Config
  let universityConfig = await prisma.universityConfig.findFirst({
    where: { name: 'University of Ruhuna (FoE)' }
  });

  if (!universityConfig) {
    universityConfig = await prisma.universityConfig.create({
      data: {
        name: 'University of Ruhuna (FoE)',
        gpaScale: 4.0,
        rounding: 2,
        creditRule: 'MANUAL',
        gradingScale: {
          "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
          "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "E": 0.0
        },
        classificationRules: [
          { name: 'First Class', minGpa: 3.7 },
          { name: 'Second Class (Upper)', minGpa: 3.3 },
          { name: 'Second Class (Lower)', minGpa: 3.0 },
          { name: 'Pass', minGpa: 2.0 }
        ],
        specialGrades: {
          "MC": { isCounted: false, pointValue: null },
          "AB": { isCounted: true, pointValue: 0.0 },
          "Not Given": { isCounted: false, pointValue: null }
        }
      }
    });
    console.log('Created University Config: Ruhuna FoE');
  }

  let user = await prisma.user.findFirst({
    where: { registrationNumber: regNumber }
  });

  if (!user) {
    console.log(`User with reg number ${regNumber} not found. Creating...`);
    const hashedPassword = await bcrypt.hash('Mesith1234@#', 10);
    user = await prisma.user.create({
      data: {
        registrationNumber: regNumber,
        firstName: "Mesith",
        lastName: "Rathanayake",
        password: hashedPassword,
        universityConfigId: universityConfig.id
      }
    });
    console.log(`Created user: ${user.firstName} ${user.lastName}`);
  }

  console.log(`Found user: ${user.firstName} ${user.lastName} (${user.id})`);

  for (const item of semesterData) {
    // Check if module already exists
    let module = await prisma.module.findFirst({
      where: {
        userId: user.id,
        moduleCode: item.code
      }
    });

    if (!module) {
      module = await prisma.module.create({
        data: {
          userId: user.id,
          moduleName: item.name.trim(),
          moduleCode: item.code.trim(),
          semester: item.sem,
          isGpaCounted: true // Assuming all these are GPA counted
        }
      });
      console.log(`Created module ${item.code}`);
    } else {
      console.log(`Module ${item.code} already exists`);
    }

    // Upsert the module result
    const existingResult = await prisma.moduleResult.findFirst({
      where: {
        moduleId: module.id,
        attemptNumber: 1
      }
    });

    if (!existingResult) {
      await prisma.moduleResult.create({
        data: {
          moduleId: module.id,
          attemptNumber: 1,
          grade: item.grade.trim(),
          isProperAttempt: true
        }
      });
      console.log(`  Added result for ${item.code}: ${item.grade}`);
    } else {
      await prisma.moduleResult.update({
        where: { id: existingResult.id },
        data: { grade: item.grade.trim() }
      });
      console.log(`  Updated result for ${item.code}: ${item.grade}`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
