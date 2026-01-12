import React from 'react';

export const AuthBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-gradient-to-br from-slate-900 via-slate-950 to-black">
      {/* Animated background elements similar to CTA section */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      
      {/* Geometric floating elements */}
      <div className="absolute top-10 left-10 w-24 h-24 border-4 border-white/10 rounded-xl animate-float-slow" style={{ transform: 'rotate(45deg)' }} />
      <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-white/5 rounded-2xl animate-float" style={{ transform: 'rotate(-20deg)' }} />
      
      {/* Glowing blobs */}
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-[100px] animate-blob" />
      <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-[120px] animate-blob delay-2000" />
      <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-emerald-500/5 rounded-full blur-[100px] animate-blob delay-4000" />
      
      {/* Rotating Border */}
      <div className="absolute top-1/3 right-1/3 w-20 h-20 border-2 border-white/5 rounded-full animate-tilt" />
      
      {/* Subtile Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]" />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/20 rounded-full animate-float-slow"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 15 + 10 + 's',
              opacity: Math.random() * 0.3
            }}
          />
        ))}
      </div>
    </div>
  );
};
