import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaGlobe } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 w-full py-8 relative z-10 border-t border-white/60 bg-white/60 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="text-center md:text-left">
          <h4 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-cyan-500">
            My Academia
          </h4>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Built by Mesith Rathnayake © {currentYear}
          </p>
        </div>

        <div className="flex gap-4">
          <a 
            href="https://mesithrathnayake.vercel.app/#home" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-sm transition-all"
            title="Portfolio"
          >
            <FaGlobe size={18} />
          </a>
          <a 
            href="https://www.linkedin.com/in/mesith-rathnayake-37647a213/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-500 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm transition-all"
            title="LinkedIn"
          >
            <FaLinkedin size={18} />
          </a>
          <a 
            href="https://github.com/Mesit-Rathnayake" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300 hover:shadow-sm transition-all"
            title="GitHub"
          >
            <FaGithub size={18} />
          </a>
          <a 
            href="mailto:mesithrathnayake0930@gmail.com" 
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 hover:shadow-sm transition-all"
            title="Email"
          >
            <FaEnvelope size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;