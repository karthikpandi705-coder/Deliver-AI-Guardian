import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        glass-panel 
        rounded-2xl 
        p-6 
        shadow-lg 
        transition-all 
        duration-350 
        ease-out
        ${hoverEffect ? 'hover:scale-[1.02] hover:border-brand-orange/40 hover:shadow-brand-orange/5' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
