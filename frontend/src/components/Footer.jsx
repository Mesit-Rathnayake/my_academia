import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaGlobe } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 w-full py-8 relative z-10 border-t border-slate-700/50">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm -z-10 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="text-center md:text-left">
          <h4 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            My Academia
          </h4>
          <p className="text-slate-400 text-sm mt-1">
            Built by Mesith Rathnayake © {currentYear}
          </p>
        </div>

        <div className="flex gap-4">
          <a 
            href="https://mesithrathnayake.vercel.app/#home" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-slate-700 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all"
            title="Portfolio"
          >
            <FaGlobe size={18} />
          </a>
          <a 
            href="https://www.linkedin.com/in/mesith-rathnayake-37647a213/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-slate-700 hover:shadow-[0_0_15px_rgba(96,165,250,0.3)] transition-all"
            title="LinkedIn"
          >
            <FaLinkedin size={18} />
          </a>
          <a 
            href="https://github.com/Mesit-Rathnayake" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all"
            title="GitHub"
          >
            <FaGithub size={18} />
          </a>
          <a 
            href="mailto:mesithrathnayake0930@gmail.com" 
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-slate-700 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all"
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