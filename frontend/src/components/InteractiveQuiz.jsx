import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
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
      <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-xs">
        <p className="font-semibold">Error: Invalid quiz format generated.</p>
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
    if (messageId) {
      localStorage.setItem(`quiz_submitted_${messageId}`, "true");
    }
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
    <div className="my-4 max-w-2xl overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] font-sans shadow-sm">
      <div className="bg-blue-600 px-5 py-3.5 text-white flex justify-between items-center">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-blue-200 block">Practice Assessment</span>
          <h3 className="text-sm font-bold tracking-tight">Module Knowledge Check</h3>
        </div>
        <span className="bg-blue-700 border border-blue-500 px-2.5 py-1 rounded font-mono text-[11px] font-semibold">
          {questions.length} Items
        </span>
      </div>

      <div className="space-y-4 bg-zinc-50/60 dark:bg-zinc-900/50 p-5">
        {questions.map((q, qIndex) => {
          const isCorrect = userAnswers[qIndex] === q.answer;
          
          return (
            <div key={q.id ?? q.question} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] p-4">
              <h4 className="mb-3 break-words whitespace-normal text-xs sm:text-sm font-semibold leading-relaxed text-zinc-900 dark:text-zinc-100">
                <span className="mr-2 font-mono text-zinc-400">{qIndex + 1}.</span>
                {q.question}
              </h4>
              <div className="space-y-2">
                {q.options.map((opt, oIndex) => {
                  const isSelected = userAnswers[qIndex] === oIndex;
                  const isActuallyCorrect = q.answer === oIndex;
                  
                  let optClass = "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-blue-400 hover:bg-zinc-50 dark:hover:bg-zinc-900";
                  let icon = null;
                  
                  if (isSelected) {
                    optClass = "border-blue-600 bg-blue-600 text-white";
                  }
                  
                  if (submitted) {
                    if (isActuallyCorrect) {
                      optClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200";
                      icon = <FaCheckCircle className="text-emerald-600 dark:text-emerald-400" size={13} />;
                    } else if (isSelected && !isActuallyCorrect) {
                      optClass = "border-red-400 bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-200";
                      icon = <FaTimesCircle className="text-red-600 dark:text-red-400" size={13} />;
                    } else {
                      optClass = "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 opacity-65";
                    }
                  }

                  return (
                    <button
                      type="button"
                      key={`${q.id ?? q.question}-${opt}`}
                      onClick={() => handleSelect(qIndex, oIndex)}
                      disabled={submitted}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg border transition-colors flex justify-between items-center gap-3 text-xs ${optClass}`}
                    >
                      <span className="font-medium break-words whitespace-normal flex-1">{opt}</span>
                      {icon && <span className="shrink-0">{icon}</span>}
                    </button>
                  );
                })}
              </div>

              {submitted && q.explanation && (
                <div className={`mt-3 rounded-lg border-l-2 p-3 text-xs ${isCorrect ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200' : 'border-red-600 bg-red-50/70 dark:bg-red-950/40 text-red-900 dark:text-red-200'}`}>
                  <p className="font-bold mb-1">{isCorrect ? 'Correct' : 'Incorrect'}</p>
                  <div className="leading-relaxed break-words whitespace-pre-wrap">{q.explanation}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121215] px-5 py-3.5">
        {submitted ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Assessment Score</span>
            <span className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
            </span>
          </div>
        ) : (
          <div className="ml-auto">
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-semibold text-white transition-colors"
            >
              Submit Answers
            </button>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={showSubmitWarning}
        title="Unanswered Questions"
        message="You haven't answered all questions. Submit anyway?"
        confirmText="Submit"
        cancelText="Continue"
        isDanger={false}
        onConfirm={confirmSubmit}
        onCancel={() => setShowSubmitWarning(false)}
      />
    </div>
  );
}

export default InteractiveQuiz;
