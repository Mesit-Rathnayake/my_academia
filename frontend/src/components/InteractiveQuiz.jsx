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
    <div className="my-6 max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white font-sans shadow-xl shadow-slate-200/70">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 shadow-md text-white flex justify-between items-center">
        <h3 className="text-2xl font-black tracking-tight drop-shadow-sm">Interactive Quiz</h3>
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-md">
          {questions.length} Questions
        </span>
      </div>

      <div className="space-y-8 bg-slate-50/70 p-6">
        {questions.map((q, qIndex) => {
          const isCorrect = userAnswers[qIndex] === q.answer;
          
          return (
            <div key={q.id ?? q.question} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="mb-4 break-words whitespace-normal text-lg font-bold leading-relaxed text-slate-800">
                <span className="mr-2 shrink-0 text-indigo-600">{qIndex + 1}.</span>
                {q.question}
              </h4>
              <div className="space-y-3">
                {q.options.map((opt, oIndex) => {
                  const isSelected = userAnswers[qIndex] === oIndex;
                  const isActuallyCorrect = q.answer === oIndex;
                  
                  let optClass = "border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50";
                  let icon = null;
                  
                  if (isSelected) {
                    optClass = "border-indigo-500 bg-indigo-50 text-indigo-900 shadow-sm shadow-indigo-100";
                  }
                  
                  if (submitted) {
                    if (isActuallyCorrect) {
                      optClass = "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm shadow-emerald-100";
                      icon = <FaCheckCircle className="text-emerald-600" />;
                    } else if (isSelected && !isActuallyCorrect) {
                      optClass = "border-red-500 bg-red-50 text-red-900 shadow-sm shadow-red-100";
                      icon = <FaTimesCircle className="text-red-600" />;
                    } else {
                      optClass = "border-slate-200 bg-slate-50 text-slate-400 opacity-70";
                    }
                  }

                  return (
                    <button
                      type="button"
                      key={`${q.id ?? q.question}-${opt}`}
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
                <div className={`mt-3 overflow-hidden rounded-xl border-l-4 p-4 text-sm ${isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-red-500 bg-red-50 text-red-800'}`}>
                  <p className="font-bold mb-1.5">{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
                  <div className="opacity-90 leading-relaxed break-words whitespace-pre-wrap">{q.explanation}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 bg-white p-6 sm:flex-row">
        {submitted ? (
          <div className="flex w-full items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3 shadow-inner sm:w-auto sm:justify-start">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <FaTrophy className="text-white text-xl" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Final Score</p>
              <p className="text-2xl font-black text-slate-900">
                {score} <span className="text-lg text-slate-400">/ {questions.length}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full sm:w-auto ml-auto">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:brightness-110 active:scale-95 sm:w-auto"
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
