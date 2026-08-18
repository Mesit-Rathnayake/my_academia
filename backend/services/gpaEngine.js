/**
 * GpaEngine - A generic, configurable engine for academic calculations.
 */
class GpaEngine {
  constructor(config) {
    this.config = config;
  }

  /**
   * Determine the credits for a module based on the university rules.
   */
  getCredits(module) {
    if (module.creditsOverride !== null && module.creditsOverride !== undefined) {
      return module.creditsOverride;
    }

    if (this.config.creditRule === 'SECOND_DIGIT_OF_MODULE_CODE') {
      const code = module.moduleCode;
      const match = code.match(/\d+/);
      if (match && match[0].length >= 2) {
        const creditDigit = parseInt(match[0].charAt(1), 10);
        return isNaN(creditDigit) ? 0 : creditDigit;
      }
    }

    return 0;
  }

  evaluateAttempt(result) {
    const { marks, grade, isProperAttempt } = result;

    let computedGrade = grade;
    let computedGpv = 0.0;
    
    if (marks !== null && marks !== undefined && !computedGrade) {
      const scaleEntry = this.config.gradingScale.find(
        (s) => marks >= s.minMarks && marks <= s.maxMarks
      );
      if (scaleEntry) computedGrade = scaleEntry.grade;
    }

    if (computedGrade) {
      const scaleEntry = this.config.gradingScale.find((s) => s.grade === computedGrade);
      if (scaleEntry) computedGpv = scaleEntry.gpv;
    }

    const isSpecial = this.config.specialGrades.includes(computedGrade);
    
    return {
      grade: computedGrade,
      gpv: computedGpv,
      isSpecial,
      isProperAttempt
    };
  }

  processModule(module) {
    const credits = this.getCredits(module);
    
    if (!module.moduleResults || module.moduleResults.length === 0) {
      return { ...module, finalCredits: credits, finalGrade: 'Pending', finalGpv: null, counted: false };
    }

    const attempts = [...module.moduleResults].sort((a, b) => a.attemptNumber - b.attemptNumber);
    const evaluations = attempts.map(a => this.evaluateAttempt(a));

    let bestGpv = null;
    let bestGrade = null;
    let isCounted = false;

    for (let i = 0; i < evaluations.length; i++) {
      const ev = evaluations[i];

      if (ev.isSpecial) {
        bestGrade = ev.grade;
        isCounted = false;
        continue;
      }

      if (ev.isProperAttempt) {
        if (bestGpv === null || ev.gpv > bestGpv) {
          bestGpv = ev.gpv;
          bestGrade = ev.grade;
          isCounted = true;
        }
      } else {
        const cGrade = this.config.gradingScale.find(s => s.grade === 'C');
        const maxRepeatGpv = cGrade ? cGrade.gpv : 2.0;
        
        let effectiveGpv = ev.gpv;
        if (effectiveGpv > maxRepeatGpv) {
          effectiveGpv = maxRepeatGpv;
        }

        if (bestGpv === null || effectiveGpv > bestGpv) {
          bestGpv = effectiveGpv;
          if (ev.gpv > maxRepeatGpv) {
             bestGrade = cGrade ? cGrade.grade : 'C';
          } else {
             bestGrade = ev.grade;
          }
          isCounted = true;
        }
      }
    }

    return {
      ...module,
      finalCredits: credits,
      finalGrade: bestGrade,
      finalGpv: bestGpv,
      counted: isCounted && module.isGpaCounted
    };
  }

  round(value) {
    if (value === null || isNaN(value)) return null;
    const factor = Math.pow(10, this.config.rounding);
    return Math.round(value * factor) / factor;
  }

  calculateSgpa(processedModules) {
    let totalCredits = 0;
    let totalWeightedGp = 0;

    for (const mod of processedModules) {
      if (mod.counted && mod.finalGpv !== null) {
        totalCredits += mod.finalCredits;
        totalWeightedGp += mod.finalCredits * mod.finalGpv;
      }
    }

    if (totalCredits === 0) return { sgpa: null, credits: 0, weightedGp: 0 };

    return {
      sgpa: this.round(totalWeightedGp / totalCredits),
      credits: totalCredits,
      weightedGp: totalWeightedGp
    };
  }

  getClassification(ogpa) {
    if (ogpa === null) return "N/A";
    const sortedRules = [...this.config.classificationRules].sort((a, b) => b.minGpa - a.minGpa);
    for (const rule of sortedRules) {
      if (ogpa >= rule.minGpa) {
        return rule.classification;
      }
    }
    return "Below Classification";
  }

  calculatePerformance(modules) {
    const processedModules = modules.map(m => this.processModule(m));
    const semesters = {};
    
    for (const mod of processedModules) {
      if (!semesters[mod.semester]) {
        semesters[mod.semester] = [];
      }
      semesters[mod.semester].push(mod);
    }

    const sgpas = {};
    let totalCountedCredits = 0;
    let totalOverallWeightedGp = 0;

    for (const sem in semesters) {
      const semResult = this.calculateSgpa(semesters[sem]);
      sgpas[sem] = semResult;

      totalCountedCredits += semResult.credits;
      totalOverallWeightedGp += semResult.weightedGp;
    }

    const ogpa = totalCountedCredits > 0 
      ? this.round(totalOverallWeightedGp / totalCountedCredits) 
      : null;

    return {
      processedModules,
      sgpas,
      ogpa,
      totalCountedCredits,
      totalWeightedGp: totalOverallWeightedGp,
      classification: this.getClassification(ogpa)
    };
  }

  calculateProjection(performance, targetGpa, totalDegreeCredits) {
    if (totalDegreeCredits <= performance.totalCountedCredits) {
      return null; // Already completed or exceeded required credits
    }
    const targetTotalGp = targetGpa * totalDegreeCredits;
    const remainingCredits = totalDegreeCredits - performance.totalCountedCredits;
    const requiredAverage = (targetTotalGp - performance.totalWeightedGp) / remainingCredits;
    
    return this.round(requiredAverage);
  }
}

module.exports = GpaEngine;
