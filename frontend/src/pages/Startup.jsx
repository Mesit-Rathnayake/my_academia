import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaArrowRight } from "react-icons/fa";
import { AVATAR_PRESETS } from "../utils/theme";

function Startup() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-6 w-full flex flex-col justify-center py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Editorial Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-[11px] font-mono uppercase tracking-wider text-blue-700 dark:text-blue-300 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>University of Ruhuna · Engineering</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-zinc-100 leading-[1.08] tracking-tight">
              Academic records, coursework, and <span className="font-serif italic font-normal text-blue-600 dark:text-blue-400">document-grounded</span> study.
            </h1>

            <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl">
              A structured workspace for engineering undergraduates. Track lecture attendance, calculate SGPA and cumulative standing under faculty credit rules, and query your lecture PDFs with page-cited answers.
            </p>

            {/* Student Avatar Stack */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-2.5">
                {AVATAR_PRESETS.slice(0, 5).map((av) => (
                  <img
                    key={av.id}
                    src={av.url}
                    alt={av.label}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 object-cover"
                  />
                ))}
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Built for <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">EC, EE, CE, ME & IS</strong> undergraduates
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs" 
                onClick={() => navigate('/login')}
              >
                Sign In to Workspace <FaArrowRight size={10} />
              </button>
              <button
                type="button"
                className="px-6 py-3 bg-white dark:bg-[#121215] border border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-400 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-lg transition-colors" 
                onClick={() => navigate('/signup')}
              >
                Create Student Account
              </button>
            </div>
          </div>

          {/* Right Preview Ledger Card */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-[#121215] rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 border-t-[3px] border-t-blue-600 shadow-sm p-6 space-y-5">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={AVATAR_PRESETS[0].url}
                    alt="Engineering Student"
                    className="w-11 h-11 rounded-full object-cover bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800"
                  />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold block">Transcript Preview</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">B.Sc. Engineering (Hons)</span>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">4.00 Scale</span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center py-2 px-3 rounded bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-zinc-800 dark:text-zinc-200 font-semibold">EC3404 · GUI Programming</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">A+</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-zinc-800 dark:text-zinc-200 font-semibold">ME2302 · Manufacturing Eng.</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">A</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 rounded bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-zinc-800 dark:text-zinc-200 font-semibold">EC3305 · Signals & Systems</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold">B+</span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                <span className="text-zinc-500 dark:text-zinc-400">RAG Lecture PDF Indexing</span>
                <span className="font-mono text-[11px] text-teal-700 dark:text-teal-400 font-semibold">ChromaDB + Gemini</span>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Startup;
