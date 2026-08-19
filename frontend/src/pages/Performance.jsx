import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import { FaGraduationCap, FaChartLine, FaTasks, FaCalculator } from 'react-icons/fa';

function Performance() {
  const [gpaData, setGpaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Projection state
  const [targetGpa, setTargetGpa] = useState('3.70');
  const [totalDegreeCredits, setTotalDegreeCredits] = useState('140');
  const [projection, setProjection] = useState(null);

  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    fetchGpaData();
  }, []);

  const fetchGpaData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiBaseUrl}/api/gpa`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch GPA data');
      
      const data = await response.json();
      setGpaData(data);
    } catch (err) {
      setError(err.message);
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

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-slate-50 text-slate-800">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
      className="flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-800 font-sans selection:bg-primary/30"
    >
      <Navbar />
      <main className="flex-1 pt-28 pb-8 px-8 lg:pt-32 lg:pb-12 lg:px-12 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900">
              Academic Performance
            </h2>
            <p className="text-slate-500 mt-2 font-medium">Track your SGPA, OGPA, and calculate what you need to achieve your goals.</p>
          </header>

          {error ? (
            <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-red-400">
              {error}
            </div>
          ) : !gpaData ? (
             <div className="text-center text-slate-500 py-12">No data available</div>
          ) : (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl relative overflow-hidden transition-all hover:shadow-md">
                  <FaGraduationCap className="absolute -right-4 -bottom-4 text-8xl text-green-50" />
                  <p className="text-green-600 font-bold uppercase tracking-wider text-xs mb-2">Current OGPA</p>
                  <h3 className="text-4xl font-black text-slate-900">{gpaData.ogpa !== null ? gpaData.ogpa.toFixed(2) : 'N/A'}</h3>
                  <p className="text-slate-500 text-sm mt-2">Cumulative Grade Point Average</p>
                </div>
                
                <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl relative overflow-hidden transition-all hover:shadow-md">
                  <FaChartLine className="absolute -right-4 -bottom-4 text-8xl text-blue-50" />
                  <p className="text-blue-600 font-bold uppercase tracking-wider text-xs mb-2">Classification</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-2 leading-tight">{gpaData.classification}</h3>
                  <p className="text-slate-500 text-sm mt-2">Based on current OGPA</p>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-3xl relative overflow-hidden transition-all hover:shadow-md">
                  <FaTasks className="absolute -right-4 -bottom-4 text-8xl text-purple-50" />
                  <p className="text-purple-600 font-bold uppercase tracking-wider text-xs mb-2">Total Credits</p>
                  <h3 className="text-4xl font-black text-slate-900">{gpaData.totalCountedCredits}</h3>
                  <p className="text-slate-500 text-sm mt-2">GPA-Counted Credits Completed</p>
                </div>
              </div>

              {/* Layout for Semester Details and Projection */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Semester Breakdown */}
                <div className="xl:col-span-2 space-y-6">
                  <h3 className="text-xl font-bold text-slate-900">Semester Breakdown</h3>
                  {Object.keys(gpaData.sgpas).length === 0 ? (
                    <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center text-slate-500 shadow-sm">
                      No semesters recorded yet. Add modules with results to see your breakdown.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(gpaData.sgpas).sort(([a], [b]) => Number(a) - Number(b)).map(([sem, data]) => (
                        <div key={sem} className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-primary/50 transition-colors shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-slate-800">Semester {sem}</h4>
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                              SGPA: {data.sgpa !== null ? data.sgpa.toFixed(2) : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-slate-500 font-medium">
                            <span>Credits: {data.credits}</span>
                            <span>Points: {data.weightedGp.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* What Do I Need Calculator */}
                <div className="bg-white border border-slate-200 p-6 rounded-3xl h-fit shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <FaCalculator className="text-2xl text-primary" />
                    <h3 className="text-xl font-bold text-slate-900">"What do I need?"</h3>
                  </div>
                  <p className="text-slate-500 text-sm mb-6">
                    Calculate the average SGPA you need for your remaining credits to reach a target OGPA.
                  </p>
                  
                  <form onSubmit={handleProjection} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Target OGPA</label>
                      <CustomSelect 
                        className="glass-input w-full px-4 py-3 rounded-xl bg-slate-50 border-none shadow-sm" 
                        value={targetGpa} 
                        onChange={setTargetGpa}
                        options={[
                          { value: "4.00", label: "4.00 - Perfect" },
                          { value: "3.70", label: "3.70 - First Class" },
                          { value: "3.30", label: "3.30 - Second Upper" },
                          { value: "3.00", label: "3.00 - Second Lower" },
                          { value: "2.00", label: "2.00 - Pass" }
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Total Degree Credits</label>
                      <input type="number" min={gpaData.totalCountedCredits + 1} className="glass-input w-full px-4 py-3 rounded-xl bg-slate-50" value={totalDegreeCredits} onChange={e => setTotalDegreeCredits(e.target.value)} required />
                      <p className="text-xs text-slate-500 mt-1">Total GPA-counted credits required to graduate (e.g., 140 for Engineering).</p>
                    </div>
                    <button type="submit" className="w-full bg-primary hover:bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold mt-2 shadow-sm transition-colors">
                      Calculate Projection
                    </button>
                  </form>

                  {projection && (
                    <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                      <p className="text-sm text-slate-600 mb-2 font-medium">To reach {projection.targetGpa} over {projection.totalDegreeCredits} credits, you need an average SGPA of:</p>
                      {projection.isPossible ? (
                        <h4 className="text-3xl font-black text-primary">{projection.requiredAverage.toFixed(2)}</h4>
                      ) : (
                        <div className="text-red-500 font-bold">
                          <h4 className="text-3xl font-black mb-1">{(projection.requiredAverage || 0).toFixed(2)}</h4>
                          <span className="text-sm">Mathematically Impossible</span>
                        </div>
                      )}
                    </div>
                  )}
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
