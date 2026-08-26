import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import WeeklyCalendar from '../components/WeeklyCalendar';
import AddTimetableEntryModal from '../components/AddTimetableEntryModal';
import BulkAddExamsModal from '../components/BulkAddExamsModal';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { FaClock, FaCalendarAlt, FaTrash, FaEdit, FaLayerGroup } from 'react-icons/fa';
import { fetchWithCache, getCache } from '../utils/cache';
import { ScheduleSkeleton, Skeleton } from '../components/Skeleton';

function Schedule() {
  const [timetable, setTimetable] = useState(() => getCache('schedule_timetable') || []);
  const [examSeries, setExamSeries] = useState(() => getCache('schedule_exam_series') || []);
  const [loading, setLoading] = useState(() => !getCache('schedule_timetable'));
  const [error, setError] = useState(null);
  
  const [showBulkAddExams, setShowBulkAddExams] = useState(false);
  const [selectedSeriesForEdit, setSelectedSeriesForEdit] = useState(null);
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
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = { 'Authorization': `Bearer ${token}` };

      const [timeData, seriesData] = await Promise.all([
        fetchWithCache(`${apiBaseUrl}/api/timetable`, { headers }, { cacheKey: 'schedule_timetable' }).catch(() => []),
        fetchWithCache(`${apiBaseUrl}/api/exam-series`, { headers }, { cacheKey: 'schedule_exam_series' }).catch(() => [])
      ]);
      
      if (timeData) setTimetable(timeData);
      if (seriesData) setExamSeries(seriesData);
    } catch (err) {
      if (timetable.length === 0) setError(err.message);
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

  if (loading && timetable.length === 0 && examSeries.length === 0) {
    return (
      <motion.div 
        initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
        className="flex flex-col h-screen overflow-hidden text-slate-800 bg-slate-50"
      >
        <Navbar />
        <main className="flex-1 pt-24 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
              <Skeleton width="200px" height="32px" />
              <Skeleton width="120px" height="40px" borderRadius="10px" />
            </div>
            <ScheduleSkeleton />
            <ScheduleSkeleton />
            <ScheduleSkeleton />
          </div>
        </main>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}
      className="flex flex-col h-screen overflow-hidden text-slate-800 bg-transparent"
    >
      <Navbar />
      <main className="flex-1 pt-28 pb-8 px-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header>
            <h2 className="text-4xl font-black text-slate-900">
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
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 relative">
              <div className="mb-6 border-b border-slate-200 pb-4 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-slate-900">Upcoming Exams</h3>
                <button 
                  onClick={() => { setSelectedSeriesForEdit(null); setShowBulkAddExams(true); }}
                  className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 hover:text-indigo-700 text-primary px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-transparent"
                >
                  <FaLayerGroup /> Add Exam Time Table
                </button>
              </div>

              <div className="space-y-8">
                {examSeries.map(series => {
                  const upcomingExams = series.exams.filter(e => new Date(e.date) > new Date());
                  const firstExam = upcomingExams.length > 0 ? upcomingExams[0] : null;

                  return (
                    <div key={series.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="bg-slate-50 p-5 border-b border-slate-200 flex justify-between items-center">
                        <h4 className="text-xl font-bold text-slate-900">{series.title}</h4>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => { setSelectedSeriesForEdit(series); setShowBulkAddExams(true); }} 
                            className="text-primary hover:text-indigo-700 bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5"
                            title="Edit Exam Series"
                          >
                            <FaEdit size={12} /> Edit Series
                          </button>
                          <button 
                            onClick={() => deleteEntry(series.id, 'exam-series')} 
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 px-3.5 py-2 rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5"
                            title="Delete Series"
                          >
                            <FaTrash size={12} /> Delete
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        {firstExam && (
                          <div className="bg-orange-50 border border-orange-100 p-5 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                              <p className="text-orange-600 font-bold uppercase tracking-widest text-xs mb-1">Countdown to First Exam</p>
                              <p className="text-lg font-bold text-slate-900">{firstExam.title}</p>
                            </div>
                            <div className="text-xl bg-white px-4 py-3 rounded-lg shadow-sm border border-slate-100">
                              {renderCountdown(firstExam.date)}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          {series.exams.map(exam => (
                            <div key={exam.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <div>
                                <p className="font-bold text-slate-800 flex items-center gap-2">
                                  <FaCalendarAlt className="text-orange-500 text-sm" /> {exam.title}
                                </p>
                              </div>
                              <div className="text-right mt-2 sm:mt-0">
                                <p className="text-slate-600 text-sm font-medium">{new Date(exam.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
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
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border-dashed border-2 border-slate-200">
                    <p className="text-slate-600 text-lg font-semibold mb-2">No upcoming exams</p>
                    <p className="text-slate-500 text-sm">Click "Add Exam Time Table" to track your schedule.</p>
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
        initialData={selectedSeriesForEdit}
        onClose={() => {
          setShowBulkAddExams(false);
          setSelectedSeriesForEdit(null);
        }}
        onSaved={() => {
          setShowBulkAddExams(false);
          setSelectedSeriesForEdit(null);
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
