const GpaEngine = require('./services/gpaEngine');

const config = {
  gpaScale: 4.0,
  rounding: 2,
  creditRule: 'SECOND_DIGIT_OF_MODULE_CODE',
  gradingScale: [
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
  ],
  classificationRules: [
    { classification: "First Class", minGpa: 3.70 },
    { classification: "Second Class Upper Division", minGpa: 3.30 },
    { classification: "Second Class Lower Division", minGpa: 3.00 },
    { classification: "No Second Class classification", minGpa: 2.00 }
  ],
  specialGrades: ["MC", "AC", "WH", "H", "M", "S", "Not Given"]
};

const engine = new GpaEngine(config);

const modules = [
  // Semester 1 (10 Credits)
  { semester: 1, moduleCode: 'CE2201', isGpaCounted: true, moduleResults: [{ attemptNumber: 1, grade: 'A', isProperAttempt: true }] }, // 2 C
  { semester: 1, moduleCode: 'EE2201', isGpaCounted: true, moduleResults: [{ attemptNumber: 1, grade: 'B+', isProperAttempt: true }] }, // 2 C
  { semester: 1, moduleCode: 'ME2301', isGpaCounted: true, moduleResults: [{ attemptNumber: 1, grade: 'C+', isProperAttempt: true }] }, // 3 C
  { semester: 1, moduleCode: 'IS2301', isGpaCounted: true, moduleResults: [{ attemptNumber: 1, grade: 'A-', isProperAttempt: true }] }, // 3 C
  
  // Semester 2 (9 Credits)
  { semester: 2, moduleCode: 'EE3301', isGpaCounted: true, moduleResults: [{ attemptNumber: 1, grade: 'C', isProperAttempt: true }] }, // 3 C
  { semester: 2, moduleCode: 'EE3302', isGpaCounted: true, moduleResults: [{ attemptNumber: 1, grade: 'C-', isProperAttempt: true }] }, // 3 C
  { semester: 2, moduleCode: 'EE3303', isGpaCounted: true, moduleResults: [{ attemptNumber: 1, grade: 'C', isProperAttempt: true }] }, // 3 C
  
  // Semester 3 (8 Credits) - Including repeats
  { semester: 3, moduleCode: 'EE4301', isGpaCounted: true, moduleResults: [{ attemptNumber: 1, grade: 'B', isProperAttempt: true }] }, // 3 C
  { semester: 3, moduleCode: 'EE4302', isGpaCounted: true, moduleResults: [
      { attemptNumber: 1, grade: 'E', isProperAttempt: true },
      { attemptNumber: 2, grade: 'A', isProperAttempt: false } // Repeat - capped at C (2.0)
    ]
  }, // 3 C
  { semester: 3, moduleCode: 'EE4203', isGpaCounted: true, moduleResults: [
      { attemptNumber: 1, grade: 'MC', isProperAttempt: true },
      { attemptNumber: 2, grade: 'A', isProperAttempt: true } // Proper repeat due to MC
    ]
  }, // 2 C
];

const result = engine.calculatePerformance(modules);

console.log("Semester 1 SGPA (Expected: 3.26): ", result.sgpas[1].sgpa);
console.log("Semester 2 SGPA (Expected: 1.90): ", result.sgpas[2].sgpa);
console.log("Semester 3 SGPA (Expected: 2.88): ", result.sgpas[3].sgpa);
console.log("OGPA (Expected: 2.69): ", result.ogpa);
console.log("Classification: ", result.classification);
