import React from 'react';
import Navbar from '../components/home/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-deep-black overflow-x-hidden">

      {/* NAVBAR */}
      <header className="sticky top-0 z-100 w-full bg-deep-black border-b border-white/5">
        <Navbar />
      </header>

      {/* CONTAINER DE BRILHOS */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">

        {/* Brilho Superior Direito  */}
        <div className="absolute top-[-5%] right-[-5%] 
                        w-87.5 h-87.5 sm:w-137.5 sm:h-137.5 lg:w-212.5 lg:h-212.5 
                        bg-liquid-purple/30 rounded-full blur-[90px] sm:blur-[130px] lg:blur-[170px]" />

        {/* Brilho Inferior Esquerdo */}
        <div className="absolute bottom-[-10%] left-[-5%] 
                        w-75 h-75 sm:w-125 sm:h-125 lg:w-212.5 lg:h-212.5 
                        bg-electric-blue/35 rounded-full blur-[80px] sm:blur-[120px] lg:blur-[170px]" />
      </div>

      {/* CONTEÚDO */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;