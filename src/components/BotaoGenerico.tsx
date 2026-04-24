import React from 'react';

interface BotaoGenericoProps {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'purple-blue' | 'blue-only';
}

const variants: Record<NonNullable<BotaoGenericoProps['variant']>, string> = {
  "purple-blue": "from-liquid-purple to-electric-blue shadow-[0_10px_20px_-10px_rgba(168,85,247,0.5)]",
  "blue-only": "from-electric-blue to-blue-500 shadow-[0_10px_20px_-10px_rgba(99,102,241,0.5)]",
};

const BotaoGenerico: React.FC<BotaoGenericoProps> = ({
  children = "Anunciar agora",
  onClick,
  className = "",
  variant = "purple-blue",
}) => {
  return (
    <div className={`relative group inline-block ${className}`}>

      <div className={`absolute -inset-1 bg-linear-to-r ${variants[variant]} rounded-full blur-lg opacity-20 group-hover:opacity-60 transition-opacity duration-500 -z-10`} />

      <button
        onClick={onClick}
        className={`relative 
                   px-6 py-2.5 
                   rounded-full 
                   text-[13px] font-black text-white uppercase tracking-widest
                   bg-linear-to-r ${variants[variant]}
                   transition-all duration-300 ease-in-out
                   hover:scale-[1.05]
                   active:scale-95
                   cursor-pointer
                   flex items-center justify-center gap-2 whitespace-nowrap`}
      >
        {children}
      </button>
    </div>
  );
};

export default BotaoGenerico;
