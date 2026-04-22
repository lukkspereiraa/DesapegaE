import React from 'react';

const UserAvatar = ({ 
  src = "https://randomuser.me/api/portraits/men/32.jpg", 
  alt = "Perfil" 
}) => {
  return (
    <div className="relative group cursor-pointer">
      <div className="absolute -inset-0.5 bg-agressive-purple rounded-full blur-[2px] shadow-[0_0_12px_rgba(191,54,255,0.8)]" />
      
      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-deep-black">
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover"
          loading="lazy" 
        />
      </div>

      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#080810]" />
    </div>
  );
};

export default UserAvatar;