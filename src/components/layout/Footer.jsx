import React from 'react';
import { Github } from 'lucide-react';
import pkg from '../../../package.json';

const Footer = () => {
    return (
        <footer className="text-center py-12 opacity-60 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest">
                PayCheckBR v{pkg.version} • {new Date().getFullYear()}
            </p>
            <a 
                href="https://github.com/thiagocajadev/PayCheckBR" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter hover:text-primary transition-colors"
            >
                <Github className="w-3 h-3" /> Source Code
            </a>
        </footer>
    );
};

export default Footer;
