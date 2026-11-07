import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaGlobe } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 w-full py-6 relative z-10 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        
        <div className="flex items-center gap-3">
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">My Academia</span>
          <span>·</span>
          <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">Mesith Rathnayake © {currentYear}</span>
        </div>

        <div className="flex items-center gap-2">
          <a 
            href="https://mesithrathnayake.vercel.app/#home" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
            title="Portfolio"
          >
            <FaGlobe size={13} />
          </a>
          <a 
            href="https://www.linkedin.com/in/mesith-rathnayake-37647a213/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-800 transition-colors"
            title="LinkedIn"
          >
            <FaLinkedin size={13} />
          </a>
          <a 
            href="https://github.com/Mesit-Rathnayake" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 transition-colors"
            title="GitHub"
          >
            <FaGithub size={13} />
          </a>
          <a 
            href="mailto:mesithrathnayake0930@gmail.com" 
            className="w-8 h-8 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 transition-colors"
            title="Email"
          >
            <FaEnvelope size={13} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
