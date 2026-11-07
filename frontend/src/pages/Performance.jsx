import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import { fetchWithCache, getCache } from '../utils/cache';
import { HeroGpaSkeleton, Skeleton } from '../components/Skeleton';
import { getDeptMeta } from '../utils/theme';

const getGradeBadge = (grade) => {
  if (!grade || grade === 'Pending') return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
  if (grade.startsWith('A')) return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70';
  if (grade.startsWith('B')) return 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/70';
  if (grade.startsWith('C')) return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/70';
  if (grade === 'E' || grade === 'F') return 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/70';
  return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
};

function Performance() {
  const [gpaData, setGpaData] = useState(() => getCache('gpa_performance') || null);
  const [loading, setLoading] = useState(() => !getCache('gpa_performance'));
  const [error, setError] = useState(null);
  const [selectedSemFilter, setSelectedSemFilter] = useState('all');

  // Projection state
  const [targetGpa, setTargetGpa] = useState('3.30');
  const [totalDegreeCredits, setTotalDegreeCredits] = useState('140');
  const [projection, setProjection] = useState(null);

  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    fetchGpaData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGpaData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const data = await fetchWithCache(`${apiBaseUrl}/api/gpa`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }, { cacheKey: 'gpa_performance' });

      if (data) setGpaData(data);
    } catch (err) {
      if (!gpaData) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProjection = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/gpa/project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetGpa, totalDegreeCredits })
      });
      
      if (!response.ok) throw new Error('Failed to calculate projection');
      
      const data = await response.json();
      setProjection(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !gpaData) {
    return (
      <div className="flex flex-col h-screen bg-[#fafaf9] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100">
        <Navbar />
        <main className="flex-1 pt-20 pb-8 px-4 sm:px-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <HeroGpaSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-white dark:bg-[#121215] rounded-xl border border-zinc-200 dark:border-zinc-800">
                <Skeleton width="160px" height="22px" className="mb-4" />
                <Skeleton height="120px" borderRadius="8px" />
              </div>
              <div className="p-5 bg-white dark:bg-[#121215] rounded-xl border border-zinc-200 dark:border-zinc-800">
                <Skeleton width="160px" height="22px" className="mb-4" />
                <Skeleton height="120px" borderRadius="8px" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const processedModules = gpaData?.processedModules || [];
  const modulesBySemester = processedModules.reduce((acc, mod) => {
    const sem = mod.semester || 1;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(mod);
    return acc;
  }, {});

  const sortedSemesters = Object.keys(gpaData?.sgpas || {}).sort((a, b) => Number(a) - Number(b));

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
      className="flex flex-col h-screen overflow-hidden bg-transparent text-zinc-900 dark:text-zinc-100"
    >
      <Navbar />
      <main className="flex-1 pt-20 pb-10 px-4 sm:px-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Page Header */}
          <header className="pb-5 border-b border-zinc-200/90 dark:border-zinc-800/90 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">University of Ruhuna · Engineering</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mt-0.5">
                Academic Transcript & GPA
              </h1>
            </div>
            <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
              4.00 Grading Scale · Second-Digit Credit Rule
            </div>
          </header>

          {error ? (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-4 rounded-lg text-red-700 dark:text-red-300 text-xs font-medium">
              {error}
            </div>
          ) : !gpaData ? (
            <div className="text-center text-zinc-500 dark:text-zinc-400 py-12 text-sm">No performance data available.</div>
          ) : (
            <>
              {/* Top Metric Strip with subtle top accent bars */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/90 border-t-[3px] border-t-emerald-500 p-5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Cumulative OGPA</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {gpaData.ogpa !== null ? gpaData.ogpa.toFixed(2) : '—'}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">/ 4.00</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/90 border-t-[3px] border-t-blue-600 p-5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Degree Standing</span>
                  <div className="mt-2">
                    <span className="text-base font-bold text-blue-700 dark:text-blue-400 leading-snug block">
                      {gpaData.classification}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/90 border-t-[3px] border-t-violet-500 p-5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Counted Credits</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {gpaData.totalCountedCredits}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">credits</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/90 border-t-[3px] border-t-amber-500 p-5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Weighted Grade Points</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {gpaData.totalWeightedGp ? gpaData.totalWeightedGp.toFixed(1) : '0.0'}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">GP</span>
                  </div>
                </div>
              </div>

              {/* Main 2-Column Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left 2 Columns: Semester Summary + Full Transcript Table */}
                <div className="xl:col-span-2 space-y-6">
                  
                  {/* Semester SGPA Cards */}
                  <div className="bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Semester SGPA Breakdown</h2>
                      <span className="text-xs font-mono text-zinc-400">{sortedSemesters.length} Semesters Recorded</span>
                    </div>

                    {sortedSemesters.length === 0 ? (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 py-4">No semesters recorded yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {sortedSemesters.map((sem) => {
                          const data = gpaData.sgpas[sem];
                          const isSelected = selectedSemFilter === String(sem);
                          return (
                            <button
                              type="button"
                              key={sem}
                              onClick={() => setSelectedSemFilter(isSelected ? 'all' : String(sem))}
                              className={`text-left p-3.5 rounded-lg border transition-colors ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                  : 'bg-zinc-50/70 dark:bg-zinc-900/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/70 border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1.5">
                                <span className={`text-[11px] font-mono uppercase ${isSelected ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                  Sem 0{sem}
                                </span>
                                <span className={`text-[10px] font-mono ${isSelected ? 'text-blue-200' : 'text-zinc-400'}`}>
                                  {data.credits} Cr
                                </span>
                              </div>
                              <div className="text-xl font-mono font-bold tabular-nums">
                                {data.sgpa !== null ? data.sgpa.toFixed(2) : '—'}
                              </div>
                              <div className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-blue-200' : 'text-zinc-400'}`}>
                                {data.weightedGp.toFixed(1)} pts
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Module Transcript Table */}
                  <div className="bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/90 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="px-5 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Module Results Ledger</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Click a semester box above to filter, or view all completed coursework.
                        </p>
                      </div>
                      {selectedSemFilter !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setSelectedSemFilter('all')}
                          className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded self-start sm:self-auto"
                        >
                          Showing Sem {selectedSemFilter} · Show All
                        </button>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/50 text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400">
                            <th className="py-2.5 px-4 font-semibold">Sem</th>
                            <th className="py-2.5 px-4 font-semibold">Code</th>
                            <th className="py-2.5 px-4 font-semibold">Module Title</th>
                            <th className="py-2.5 px-4 font-semibold text-right">Credits</th>
                            <th className="py-2.5 px-4 font-semibold text-center">Grade</th>
                            <th className="py-2.5 px-4 font-semibold text-right">GPV</th>
                            <th className="py-2.5 px-4 font-semibold text-right">Weighted GP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                          {sortedSemesters
                            .filter(sem => selectedSemFilter === 'all' || String(sem) === selectedSemFilter)
                            .flatMap(sem => (modulesBySemester[sem] || []))
                            .map((mod) => {
                              const weighted = mod.counted && mod.finalGpv !== null 
                                ? (mod.finalCredits * mod.finalGpv).toFixed(1) 
                                : '—';
                              const dept = getDeptMeta(mod.moduleCode);
                              return (
                                <tr key={mod.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                                  <td className="py-2.5 px-4 font-mono text-zinc-400">S0{mod.semester}</td>
                                  <td className="py-2.5 px-4">
                                    <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded border ${dept.codeBadge}`}>
                                      {mod.moduleCode}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-4 font-medium text-zinc-900 dark:text-zinc-100">{mod.moduleName}</td>
                                  <td className="py-2.5 px-4 font-mono text-right text-zinc-600 dark:text-zinc-400 tabular-nums">{mod.finalCredits}</td>
                                  <td className="py-2.5 px-4 text-center">
                                    <span className={`inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${getGradeBadge(mod.finalGrade)}`}>
                                      {mod.finalGrade || '—'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-4 font-mono text-right text-zinc-600 dark:text-zinc-400 tabular-nums">
                                    {mod.finalGpv !== null ? mod.finalGpv.toFixed(1) : '—'}
                                  </td>
                                  <td className="py-2.5 px-4 font-mono text-right font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                                    {weighted}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right Column: Target GPA Projection Calculator */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/90 p-5 rounded-xl h-fit shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">Target Forecaster</span>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">Required GPA Projection</h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
                        Calculate the minimum average SGPA required across your remaining credits to hit your target class.
                      </p>
                    </div>
                    
                    <form onSubmit={handleProjection} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Target Cumulative GPA</label>
                        <CustomSelect 
                          className="glass-input w-full px-3 py-2 rounded-lg text-xs font-medium" 
                          value={targetGpa} 
                          onChange={setTargetGpa}
                          options={[
                            { value: "3.70", label: "3.70 — First Class" },
                            { value: "3.30", label: "3.30 — Second Class (Upper)" },
                            { value: "3.00", label: "3.00 — Second Class (Lower)" },
                            { value: "2.00", label: "2.00 — General Pass" },
                            { value: "4.00", label: "4.00 — Maximum Scale" }
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Total Degree Credits</label>
                        <input 
                          type="number" 
                          min={gpaData.totalCountedCredits + 1} 
                          className="glass-input w-full px-3 py-2 rounded-lg text-xs font-mono" 
                          value={totalDegreeCredits} 
                          onChange={e => setTotalDegreeCredits(e.target.value)} 
                          required 
                        />
                        <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                          Completed: {gpaData.totalCountedCredits} Cr · Remaining: {Math.max(0, Number(totalDegreeCredits) - gpaData.totalCountedCredits)} Cr
                        </p>
                      </div>
                      <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                      >
                        Run Projection
                      </button>
                    </form>

                    {projection && (
                      <div className="mt-5 p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-lg border border-zinc-200/80 dark:border-zinc-800">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400">Required Remaining Avg</span>
                          <span className="text-[11px] font-mono text-zinc-400">
                            over {projection.totalDegreeCredits - projection.completedCredits} Cr
                          </span>
                        </div>
                        {projection.isPossible ? (
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                              {projection.requiredAverage.toFixed(2)}
                            </span>
                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                              Achievable
                            </span>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <span className="text-2xl font-mono font-bold text-red-600 dark:text-red-400 tabular-nums mr-2">
                              {(projection.requiredAverage || 0).toFixed(2)}
                            </span>
                            <span className="text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 px-2 py-0.5 rounded">
                              Exceeds 4.00 Scale
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Classification Reference Card */}
                  <div className="bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800/90 p-5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold mb-3">
                      Ruhuna Classification Thresholds
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/70">
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">First Class</span>
                        <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">≥ 3.70</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/70">
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">Second Class (Upper)</span>
                        <span className="font-mono font-semibold text-blue-700 dark:text-blue-400">≥ 3.30</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/70">
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">Second Class (Lower)</span>
                        <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">≥ 3.00</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">Pass</span>
                        <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">≥ 2.00</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}

        </div>
        <Footer />
      </main>
    </motion.div>
  );
}

export default Performance;
