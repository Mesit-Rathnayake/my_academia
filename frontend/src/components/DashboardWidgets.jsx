import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaArrowRight, FaExclamationCircle, FaGraduationCap } from 'react-icons/fa';
import { motion } from 'framer-motion';

function DashboardWidgets({ timetable = [], examSeries = [], gpaData = null }) {
  const [currentDay, setCurrentDay] = useState(new Date().getDay());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Today's classes
  const todaysClasses = timetable
    .filter(entry => entry.dayOfWeek === currentDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Next Upcoming Exam Series
  let nextExamSeries = null;
  let nextExam = null;
  
  const upcomingSeries = examSeries
    .map(series => {
      const upcomingExams = series.exams.filter(e => new Date(e.date) > new Date());
      if (upcomingExams.length > 0) {
        return {
          ...series,
          firstUpcomingExam: upcomingExams.sort((a, b) => new Date(a.date) - new Date(b.date))[0]
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.firstUpcomingExam.date) - new Date(b.firstUpcomingExam.date));

  if (upcomingSeries.length > 0) {
    nextExamSeries = upcomingSeries[0];
    nextExam = nextExamSeries.firstUpcomingExam;
  }

  // Render countdown logic (copied and adapted from Schedule for consistency)
  const renderCountdown = (targetDateStr) => {
    const targetDate = new Date(targetDateStr);
    const now = new Date();
    const diff = targetDate - now;

    if (diff <= 0) return <span className="text-red-400 font-bold text-sm">Exam started or passed</span>;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

    return (
      <div className="flex items-center gap-2 font-black text-orange-400 text-lg sm:text-xl">
        <FaClock />
        <span>{days > 0 ? `${days}d ` : ''}{hours}h left</span>
      </div>
    );
  };

  const daysNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Today's Classes Widget */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 flex flex-col h-full relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FaCalendarAlt className="text-primary" /> Today's Classes
            </h3>
            <p className="text-slate-500 text-sm mt-1">{daysNames[currentDay]}, {currentTime.toLocaleDateString()}</p>
          </div>
          <Link to="/schedule" className="text-primary hover:text-indigo-600 text-sm font-bold flex items-center gap-1 transition-colors">
            View All <FaArrowRight size={10} />
          </Link>
        </div>

        <div className="flex-1 space-y-3 flex flex-col justify-center">
          {todaysClasses.length > 0 ? (
            todaysClasses.slice(0, 3).map(cls => (
              <div key={cls.id} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100/80 flex justify-between items-center hover:border-primary/30 transition-colors">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{cls.type}</h4>
                  {cls.location && <p className="text-slate-500 text-xs mt-0.5">📍 {cls.location}</p>}
                </div>
                <div className="bg-primary/10 px-3 py-1.5 rounded-lg text-primary font-bold text-xs tracking-wider">
                  {cls.startTime} - {cls.endTime}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <div className="bg-slate-50/80 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                <span className="text-2xl">🎉</span>
              </div>
              <p className="text-slate-700 font-bold">No classes today!</p>
              <p className="text-slate-500 text-sm mt-1">Enjoy your free time or hit the books.</p>
            </div>
          )}
          
          {todaysClasses.length > 3 && (
            <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-wider pt-2">
              + {todaysClasses.length - 3} more classes
            </p>
          )}
        </div>
      </motion.div>

      {/* Upcoming Exam Widget */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 flex flex-col h-full relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FaExclamationCircle className="text-orange-500" /> Next Upcoming Exam
            </h3>
            <p className="text-slate-500 text-sm mt-1">Stay prepared and focused.</p>
          </div>
          <Link to="/schedule" className="text-orange-500 hover:text-orange-600 text-sm font-bold flex items-center gap-1 transition-colors">
            Timetable <FaArrowRight size={10} />
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {nextExamSeries ? (
            <div className="bg-orange-50/80 p-5 rounded-2xl relative overflow-hidden border border-orange-100 transition-colors">
              <p className="text-orange-600 font-bold uppercase tracking-widest text-[10px] mb-1">Part of: {nextExamSeries.title}</p>
              <h4 className="text-xl font-black text-slate-900 mb-4 leading-tight">{nextExam.title}</h4>
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mt-auto">
                <div>
                  <p className="text-slate-500 text-xs font-semibold">{new Date(nextExam.date).toLocaleDateString()}</p>
                  <p className="text-slate-700 text-sm font-bold mt-0.5">⏱️ {new Date(nextExam.date).toLocaleTimeString()}</p>
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-orange-200 shadow-sm flex items-center gap-2 self-start sm:self-auto">
                  <FaClock className="text-orange-500 text-xs animate-pulse" />
                  <span className="text-xs font-black text-orange-600 uppercase tracking-wider">
                    {Math.ceil((new Date(nextExam.date) - new Date()) / (1000 * 60 * 60 * 24))}d left
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="bg-slate-50/80 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                <span className="text-2xl">😎</span>
              </div>
              <p className="text-slate-700 font-bold">No upcoming exams!</p>
              <p className="text-slate-500 text-sm mt-1">You are all clear for now.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* GPA Widget */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/5 flex flex-col h-full relative overflow-hidden"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FaGraduationCap className="text-green-500" /> Academic Standing
            </h3>
            <p className="text-slate-500 text-sm mt-1">Your current performance.</p>
          </div>
          <Link to="/academic-performance" className="text-green-500 hover:text-green-600 text-sm font-bold flex items-center gap-1 transition-colors">
            Details <FaArrowRight size={10} />
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center text-center">
          {gpaData ? (
            <div className="bg-green-50 p-5 rounded-2xl border border-green-100 relative overflow-hidden transition-colors">
              <p className="text-green-700 font-bold uppercase tracking-widest text-[10px] mb-2">Overall GPA</p>
              <h4 className="text-5xl font-black text-slate-900 mb-2">{gpaData.ogpa !== null ? gpaData.ogpa.toFixed(2) : 'N/A'}</h4>
              <p className="text-green-800 text-sm font-medium mb-1 bg-white py-1.5 px-3 rounded-lg inline-block border border-green-200">
                {gpaData.classification || 'No Classification'}
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100">
                <span className="text-2xl">🎓</span>
              </div>
              <p className="text-slate-700 font-bold">No GPA Data</p>
              <p className="text-slate-500 text-sm mt-1">Add module results to see it here.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default DashboardWidgets;
