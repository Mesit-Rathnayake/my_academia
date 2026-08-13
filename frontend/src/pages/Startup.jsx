import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import man1 from "../images/man1.png";
import Footer from "../components/Footer";

function Startup() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans relative z-50 overflow-hidden">
      <Header />
      <div className="flex-1 max-w-7xl mx-auto px-6 w-full flex flex-col lg:flex-row items-center lg:items-end justify-between gap-12 pt-12 relative">
        <div className="flex-1 space-y-8 max-w-xl text-center lg:text-left relative z-10 mb-12 lg:mb-32">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Your Study Life,<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Sorted and Simplified
            </span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed font-medium">
            Tired of scrambling through notes and deadlines? 
            My Academia is your personal academic tracker — here to help you plan, progress, and perform. 
            Track lecture attendance, submit assessments, calculate grades, and make sure you're always exam-ready.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button 
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5" 
              onClick={() => navigate('/login')}
            >
              Log In
            </button>
            <button 
              className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 hover:border-primary text-slate-900 hover:text-primary font-bold rounded-xl shadow-sm transition-all hover:-translate-y-0.5" 
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-end w-full max-w-xl xl:max-w-2xl relative mt-auto">
          {/* Decorative Rings */}
          <div className="absolute w-[600px] h-[600px] rounded-full border-[40px] border-primary/10 -z-10 animate-[spin_30s_linear_infinite] top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%]"></div>
          <div className="absolute w-[450px] h-[450px] rounded-full border-[28px] border-secondary/15 -z-10 animate-[spin_20s_linear_infinite_reverse] top-1/2 left-1/2 -translate-x-[48%] -translate-y-[52%]"></div>
          <div className="absolute w-[650px] h-[650px] rounded-full bg-gradient-to-br from-primary/5 to-secondary/5 -z-20 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

          <img src={man1} alt="Student illustration" className="w-[110%] max-w-none h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500 relative z-10" />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Startup;