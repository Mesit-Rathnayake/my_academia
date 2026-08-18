import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import WeeklyCalendar from '../components/WeeklyCalendar';
import AddTimetableEntryModal from '../components/AddTimetableEntryModal';
import BulkAddExamsModal from '../components/BulkAddExamsModal';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { FaClock, FaCalendarAlt, FaTrash, FaLayerGroup } from 'react-icons/fa';

function Schedule() {
  const [timetable, setTimetable] = useState([]);
  const [examSeries, setExamSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showBulkAddExams, setShowBulkAddExams] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [initialAddClassData, setInitialAddClassData] = useState({ day: 1, time: '08:00' });
  
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      // Force re-render every minute for countdowns
      setExamSeries(e => [...e]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [timeRes, seriesRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/timetable`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${apiBaseUrl}/api/exam-series`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (!timeRes.ok || !seriesRes.ok) throw new Error('Failed to fetch data');
      
      setTimetable(await timeRes.json());
      setExamSeries(await seriesRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };





  const deleteEntry = async (id, type) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiBaseUrl}/api/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const renderCountdown = (dateString) => {
    const target = new Date(dateString);
    const now = new Date();
    const diff = target - now;
    
    if (diff < 0) return <span className="text-red-400 font-bold">Exam Finished</span>;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    
    return (
      <span className="text-orange-400 font-bold flex gap-2 items-center">
        <FaClock /> {days}d {hours}h remaining
      </span>
    );
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  if (loading) {
    return (
      <motion.div 
        initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
        className="flex flex-col h-screen overflow-hidden text-slate-100 bg-slate-900"
      >
        <Navbar />
        <main className="flex-1 pt-20 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
      className="flex flex-col h-screen overflow-hidden text-slate-100 bg-slate-900"
    >
      <Navbar />
      <main className="flex-1 pt-28 pb-8 px-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header>
            <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-orange-400">
              Schedule & Planner
            </h2>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Timetable Section */}
            <div className="flex flex-col">
              <WeeklyCalendar 
                timetable={timetable} 
                onDelete={(id) => deleteEntry(id, 'timetable')}
                onAddClick={(day, time) => {
                  setInitialAddClassData({ day, time });
                  setShowAddClass(true);
                }}
              />
            </div>

            {/* Exams Section */}
            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl relative">
              <div className="mb-6 border-b border-slate-700 pb-4 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Upcoming Exams</h3>
                <button 
                  onClick={() => setShowBulkAddExams(true)}
                  className="flex items-center gap-2 bg-slate-700/50 hover:bg-orange-500/20 hover:text-orange-400 text-slate-300 px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-transparent hover:border-orange-500/30"
                >
                  <FaLayerGroup /> Add Exam Time Table
                </button>
              </div>

              <div className="space-y-8">
                {examSeries.map(series => {
                  const upcomingExams = series.exams.filter(e => new Date(e.date) > new Date());
                  const firstExam = upcomingExams.length > 0 ? upcomingExams[0] : null;

                  return (
                    <div key={series.id} className="bg-slate-900/40 rounded-2xl border border-slate-700/50 overflow-hidden shadow-lg">
                      <div className="bg-slate-800/80 p-5 border-b border-slate-700/50 flex justify-between items-center">
                        <h4 className="text-xl font-bold text-white">{series.title}</h4>
                        <button onClick={() => deleteEntry(series.id, 'exam-series')} className="text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-3 py-2 rounded-xl transition-colors text-sm font-medium flex items-center gap-2">
                          <FaTrash size={12} /> Delete Series
                        </button>
                      </div>
                      
                      <div className="p-5">
                        {firstExam && (
                          <div className="bg-gradient-to-br from-orange-500/10 to-rose-500/10 border border-orange-500/20 p-5 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                              <p className="text-orange-400 font-bold uppercase tracking-widest text-xs mb-1">Countdown to First Exam</p>
                              <p className="text-lg font-bold text-white">{firstExam.title}</p>
                            </div>
                            <div className="text-xl bg-slate-900/80 px-4 py-3 rounded-lg shadow-inner border border-slate-700">
                              {renderCountdown(firstExam.date)}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          {series.exams.map(exam => (
                            <div key={exam.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                              <div>
                                <p className="font-bold text-slate-200 flex items-center gap-2">
                                  <FaCalendarAlt className="text-orange-400 text-sm" /> {exam.title}
                                </p>
                              </div>
                              <div className="text-right mt-2 sm:mt-0">
                                <p className="text-slate-300 text-sm font-medium">{new Date(exam.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                {exam.location && <p className="text-slate-500 text-xs mt-0.5">📍 {exam.location}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {examSeries.length === 0 && (
                  <div className="text-center py-12 bg-slate-900/30 rounded-2xl border-dashed border-2 border-slate-700/50">
                    <p className="text-slate-400 text-lg font-semibold mb-2">No upcoming exams</p>
                    <p className="text-slate-500 text-sm">Click "Add Examination Series" to track your schedule.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        <Footer />
      </main>

      <BulkAddExamsModal 
        isOpen={showBulkAddExams} 
        onClose={() => setShowBulkAddExams(false)}
        onSaved={() => {
          setShowBulkAddExams(false);
          fetchData();
        }}
      />

      <AddTimetableEntryModal 
        isOpen={showAddClass}
        onClose={() => setShowAddClass(false)}
        onSaved={() => {
          setShowAddClass(false);
          fetchData();
        }}
        initialDay={initialAddClassData.day}
        initialStartTime={initialAddClassData.time}
      />
    </motion.div>
  );
}

export default Schedule;
