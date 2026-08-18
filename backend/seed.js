const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
  
  // Assign to existing users if they don't have one
  await prisma.user.updateMany({
    where: { universityConfigId: null },
    data: { universityConfigId: ruhunaConfig.id }
  });
  
  console.log('Assigned config to existing users.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
