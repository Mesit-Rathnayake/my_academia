import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import WeeklyCalendar from '../components/WeeklyCalendar';
import AddTimetableEntryModal from '../components/AddTimetableEntryModal';
import BulkAddExamsModal from '../components/BulkAddExamsModal';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { FaClock, FaTrash, FaEdit, FaPlus } from 'react-icons/fa';
import { fetchWithCache, getCache } from '../utils/cache';
import { ScheduleSkeleton, Skeleton } from '../components/Skeleton';

function Schedule() {
  const [timetable, setTimetable] = useState(() => getCache('schedule_timetable') || []);
  const [examSeries, setExamSeries] = useState(() => getCache('schedule_exam_series') || []);
  const [loading, setLoading] = useState(() => !getCache('schedule_timetable'));
  const [, setError] = useState(null);
  
  const [showBulkAddExams, setShowBulkAddExams] = useState(false);
  const [selectedSeriesForEdit, setSelectedSeriesForEdit] = useState(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [initialAddClassData, setInitialAddClassData] = useState({ day: 1, time: '08:00' });
  
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setExamSeries(e => [...e]);
    }, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    
    if (diff < 0) return <span className="text-zinc-400 font-mono text-xs">Concluded</span>;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    
    return (
      <span className="text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/70 px-2.5 py-1 rounded font-mono text-xs font-semibold flex gap-1.5 items-center tabular-nums">
        <FaClock size={10} /> {days}d {hours}h
      </span>
    );
  };

  if (loading && timetable.length === 0 && examSeries.length === 0) {
    return (
      <div className="flex flex-col h-screen overflow-hidden text-zinc-900 dark:text-zinc-100 bg-[#fafaf9] dark:bg-[#09090b]">
        <Navbar />
        <main className="flex-1 pt-20 p-6 sm:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
              <Skeleton width="200px" height="28px" />
              <Skeleton width="120px" height="36px" borderRadius="8px" />
            </div>
            <ScheduleSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
      className="flex flex-col h-screen overflow-hidden text-zinc-900 dark:text-zinc-100 bg-transparent"
    >
      <Navbar />
      <main className="flex-1 pt-20 pb-10 px-4 sm:px-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <header className="pb-5 border-b border-zinc-200/90 dark:border-zinc-800/90 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">Academic Calendar</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mt-0.5">
                Timetable & Examinations
              </h1>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Timetable Section */}
            <div className="lg:col-span-7 flex flex-col">
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
            <div className="lg:col-span-5 bg-white dark:bg-[#121215] p-5 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)] h-fit">
              <div className="mb-5 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80 flex justify-between items-center">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Examination Series</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Scheduled papers and countdowns</p>
                </div>
                <button 
                  onClick={() => { setSelectedSeriesForEdit(null); setShowBulkAddExams(true); }}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <FaPlus size={10} /> New Series
                </button>
              </div>

              <div className="space-y-4">
                {examSeries.map(series => {
                  const upcomingExams = series.exams.filter(e => new Date(e.date) > new Date());
                  const firstExam = upcomingExams.length > 0 ? upcomingExams[0] : null;

                  return (
                    <div key={series.id} className="bg-white dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                      <div className="bg-zinc-50 dark:bg-zinc-900 px-4 py-3 border-b border-zinc-200/80 dark:border-zinc-800 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{series.title}</h3>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => { setSelectedSeriesForEdit(series); setShowBulkAddExams(true); }} 
                            className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1"
                            title="Edit Exam Series"
                          >
                            <FaEdit size={10} /> Edit
                          </button>
                          <button 
                            onClick={() => deleteEntry(series.id, 'exam-series')} 
                            className="text-zinc-400 hover:text-red-600 p-1 rounded transition-colors"
                            title="Delete Series"
                          >
                            <FaTrash size={11} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        {firstExam && (
                          <div className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 p-3 rounded-lg mb-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold block">Next Paper</span>
                              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{firstExam.title}</p>
                            </div>
                            {renderCountdown(firstExam.date)}
                          </div>
                        )}

                        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {series.exams.map(exam => (
                            <div key={exam.id} className="flex justify-between items-center py-2.5 text-xs">
                              <span className="font-medium text-zinc-800 dark:text-zinc-200">{exam.title}</span>
                              <div className="text-right font-mono text-[11px] text-zinc-500 dark:text-zinc-400 tabular-nums">
                                <span>{new Date(exam.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                {exam.location && <span className="ml-2 text-zinc-400">· {exam.location}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {examSeries.length === 0 && (
                  <div className="text-center py-10 bg-zinc-50/60 dark:bg-zinc-900/40 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
                    <p className="text-zinc-700 dark:text-zinc-300 text-xs font-semibold mb-1">No examination series scheduled</p>
                    <p className="text-zinc-400 text-xs">Add an exam series to track paper dates and countdowns.</p>
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
