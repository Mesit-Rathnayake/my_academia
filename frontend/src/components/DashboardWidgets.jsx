import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaGraduationCap, FaCalendarAlt, FaClock } from 'react-icons/fa';

function DashboardWidgets({ timetable = [], examSeries = [], gpaData = null }) {
  const [currentDay] = useState(new Date().getDay());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const todaysClasses = timetable
    .filter(entry => entry.dayOfWeek === currentDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

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

  const daysNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
      {/* Academic Standing Card */}
      <div className="bg-white dark:bg-[#121215] rounded-xl p-5 border border-zinc-200/90 dark:border-zinc-800/90 border-l-4 border-l-emerald-500 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FaGraduationCap size={12} />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              Cumulative Standing
            </span>
          </div>
          <Link to="/academic-performance" className="text-emerald-600 dark:text-emerald-400 hover:underline text-xs font-semibold flex items-center gap-1 transition-colors">
            Transcript <FaArrowRight size={9} />
          </Link>
        </div>

        {gpaData ? (
          <div className="flex items-baseline justify-between gap-4 pt-1">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight">
                  {gpaData.ogpa !== null ? gpaData.ogpa.toFixed(2) : '—'}
                </span>
                <span className="text-xs font-mono text-zinc-400">/ 4.00 OGPA</span>
              </div>
              <span className="inline-block text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/70 px-2 py-0.5 rounded mt-2">
                {gpaData.classification || 'Unclassified'}
              </span>
            </div>
            <div className="text-right border-l border-zinc-100 dark:border-zinc-800 pl-4">
              <span className="block text-xl font-mono font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">
                {gpaData.totalCountedCredits || 0}
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">Credits Earned</span>
            </div>
          </div>
        ) : (
          <div className="py-4 text-xs text-zinc-500 dark:text-zinc-400">
            No graded modules recorded yet.
          </div>
        )}
      </div>

      {/* Today's Schedule Card */}
      <div className="bg-white dark:bg-[#121215] rounded-xl p-5 border border-zinc-200/90 dark:border-zinc-800/90 border-l-4 border-l-blue-600 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FaCalendarAlt size={11} />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              {daysNames[currentDay]} Schedule
            </span>
          </div>
          <Link to="/schedule" className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-semibold flex items-center gap-1 transition-colors">
            Timetable <FaArrowRight size={9} />
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {todaysClasses.length > 0 ? (
            <div className="space-y-2">
              {todaysClasses.slice(0, 2).map(cls => (
                <div key={cls.id} className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 text-xs">
                  <div className="truncate pr-2">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{cls.type}</span>
                    {cls.location && <span className="text-zinc-400 ml-2">{cls.location}</span>}
                  </div>
                  <span className="font-mono text-[11px] text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded shrink-0 tabular-nums">
                    {cls.startTime}–{cls.endTime}
                  </span>
                </div>
              ))}
              {todaysClasses.length > 2 && (
                <p className="text-[11px] text-zinc-400 font-mono">
                  +{todaysClasses.length - 2} more session(s)
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No timetabled sessions</p>
                <p className="text-xs text-zinc-400 mt-0.5">{currentTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                Free Day
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Examination Card */}
      <div className="bg-white dark:bg-[#121215] rounded-xl p-5 border border-zinc-200/90 dark:border-zinc-800/90 border-l-4 border-l-amber-500 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FaClock size={11} />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              Next Examination
            </span>
          </div>
          <Link to="/schedule" className="text-amber-600 dark:text-amber-400 hover:underline text-xs font-semibold flex items-center gap-1 transition-colors">
            Manage <FaArrowRight size={9} />
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {nextExamSeries ? (
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{nextExam.title}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  {new Date(nextExam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {nextExamSeries.title}
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/70 px-2.5 py-1 rounded shrink-0 tabular-nums">
                {Math.max(0, Math.ceil((new Date(nextExam.date) - new Date()) / (1000 * 60 * 60 * 24)))}d left
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No scheduled exams</p>
                <p className="text-xs text-zinc-400 mt-0.5">Add an exam series in Timetable</p>
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                Clear
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardWidgets;
