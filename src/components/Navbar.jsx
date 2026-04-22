import React from 'react';
import BrandLogo from './Logo';
import BotaoGenerico from './BotaoGenerico';
import UserAvatar from './UserAvatar';
import BarraPesquisa from './BarraPesquisa';

const Navbar = () => {
  return (
    <nav className="w-full h-20 
                    bg-[#080810]/90 backdrop-blur-md
                    px-10 
                    border-b border-white/5 
                    sticky top-0 z-[100] 
                    flex items-center justify-between">
      
      {/* 1. Lado Esquerdo: Logo */}
      <div className="flex-shrink-0">
        <BrandLogo cidade="Cedro" />
      </div>

      {/* 2. Centro: Barra de Pesquisa */}
      <div className="flex-1 flex justify-center max-w-2xl px-8">
        <BarraPesquisa />
      </div>

      {/* 3. Lado Direito: Ações Diretas */}
      <div className="flex items-center gap-6 flex-shrink-0">
        <BotaoGenerico onClick={() => console.log("Anunciar!")}>
          Anunciar agora
        </BotaoGenerico>
    
        <div className="w-[1px] h-6 bg-white/10 mx-1" />

        <UserAvatar />
      </div>
    </nav>
  );
};

export default Navbar;