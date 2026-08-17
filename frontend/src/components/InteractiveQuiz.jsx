import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaTrophy } from 'react-icons/fa';
import ConfirmModal from './ConfirmModal';

function InteractiveQuiz({ questions, messageId }) {
  const [userAnswers, setUserAnswers] = useState(() => {
    if (messageId) {
      const saved = localStorage.getItem(`quiz_answers_${messageId}`);
      if (saved) return JSON.parse(saved);
    }
    return {};
  });
  
  const [submitted, setSubmitted] = useState(() => {
    if (messageId) {
      const saved = localStorage.getItem(`quiz_submitted_${messageId}`);
      if (saved) return JSON.parse(saved);
    }
    return false;
  });
  
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);

  if (!Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="bg-red-500/20 text-red-200 p-4 rounded-xl border border-red-500/50">
        <p className="font-bold">Error: Invalid quiz format generated.</p>
      </div>
    );
  }

  const handleSelect = (qIndex, oIndex) => {
    if (submitted) return;
    const newAnswers = { ...userAnswers, [qIndex]: oIndex };
    setUserAnswers(newAnswers);
    if (messageId) {
      localStorage.setItem(`quiz_answers_${messageId}`, JSON.stringify(newAnswers));
    }
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length < questions.length) {
      setShowSubmitWarning(true);
      return;
    }
    setSubmitted(true);
  };

  const confirmSubmit = () => {
    setShowSubmitWarning(false);
    setSubmitted(true);
    if (messageId) {
      localStorage.setItem(`quiz_submitted_${messageId}`, "true");
    }
  };

  const score = Object.keys(userAnswers).reduce((acc, qIndex) => {
    if (userAnswers[qIndex] === questions[qIndex].answer) {
      return acc + 1;
    }
    return acc;
  }, 0);

  return (
    <div className="my-6 max-w-2xl bg-slate-800/80 rounded-3xl border border-slate-600/50 shadow-2xl overflow-hidden font-sans">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 shadow-md text-white flex justify-between items-center">
        <h3 className="text-2xl font-black tracking-tight drop-shadow-sm">Interactive Quiz</h3>
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-md">
          {questions.length} Questions
        </span>
      </div>

      <div className="p-6 space-y-8">
        {questions.map((q, qIndex) => {
          const isCorrect = userAnswers[qIndex] === q.answer;
          
          return (
            <div key={qIndex} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 shadow-inner">
              <h4 className="text-lg font-bold text-slate-100 mb-4 leading-relaxed break-words whitespace-normal">
                <span className="text-purple-400 mr-2 shrink-0">{qIndex + 1}.</span>
                {q.question}
              </h4>
              <div className="space-y-3">
                {q.options.map((opt, oIndex) => {
                  const isSelected = userAnswers[qIndex] === oIndex;
                  const isActuallyCorrect = q.answer === oIndex;
                  
                  let optClass = "border-slate-600/50 hover:border-purple-400 hover:bg-purple-900/20 text-slate-300";
                  let icon = null;
                  
                  if (isSelected) {
                    optClass = "border-purple-500 bg-purple-900/40 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.2)]";
                  }
                  
                  if (submitted) {
                    if (isActuallyCorrect) {
                      optClass = "border-emerald-500 bg-emerald-900/40 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                      icon = <FaCheckCircle className="text-emerald-400" />;
                    } else if (isSelected && !isActuallyCorrect) {
                      optClass = "border-red-500 bg-red-900/40 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
                      icon = <FaTimesCircle className="text-red-400" />;
                    } else {
                      optClass = "border-slate-700/50 bg-slate-800/30 text-slate-500 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={oIndex}
                      onClick={() => handleSelect(qIndex, oIndex)}
                      disabled={submitted}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center gap-4 ${optClass}`}
                    >
                      <span className="font-medium text-[15px] break-words whitespace-normal flex-1">{opt}</span>
                      {icon && <span className="shrink-0">{icon}</span>}
                    </button>
                  );
                })}
              </div>

              {submitted && q.explanation && (
                <div className={`mt-3 p-4 rounded-xl text-sm border-l-4 overflow-hidden ${isCorrect ? 'bg-emerald-500/10 border-emerald-500 text-emerald-200' : 'bg-red-500/10 border-red-500 text-red-200'}`}>
                  <p className="font-bold mb-1.5">{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
                  <div className="opacity-90 leading-relaxed break-words whitespace-pre-wrap">{q.explanation}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-slate-800 border-t border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
        {submitted ? (
          <div className="flex items-center gap-4 bg-slate-900/80 px-6 py-3 rounded-2xl border border-slate-600 shadow-inner w-full sm:w-auto justify-center sm:justify-start">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <FaTrophy className="text-white text-xl" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Final Score</p>
              <p className="text-2xl font-black text-white">
                {score} <span className="text-slate-500 text-lg">/ {questions.length}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full sm:w-auto ml-auto">
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all transform hover:scale-105 active:scale-95"
            >
              Submit Quiz
            </button>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={showSubmitWarning}
        title="Unanswered Questions"
        message="You haven't answered all the questions. Are you sure you want to submit anyway?"
        confirmText="Submit"
        cancelText="Keep Trying"
        isDanger={false}
        onConfirm={confirmSubmit}
        onCancel={() => setShowSubmitWarning(false)}
      />
    </div>
  );
}

export default InteractiveQuiz;
