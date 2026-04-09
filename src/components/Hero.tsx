import React from 'react';
import { motion } from 'motion/react';
import { Gamepad2, ChevronDown } from 'lucide-react';

interface HeroProps {
  guestName: string;
}

export const Hero: React.FC<HeroProps> = ({ guestName }) => {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 px-6 overflow-hidden">
      {/* Animated Particles (Simplified for now) */}
      <div className="particles-container">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5
            }}
            animate={{ 
              y: [null, Math.random() * -100, Math.random() * 100],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ 
              duration: 5 + Math.random() * 10, 
              repeat: Infinity,
              ease: "linear"
            }}
            className={`absolute w-1 h-1 rounded-full ${
              i % 3 === 0 ? 'bg-neon-yellow' : i % 3 === 1 ? 'bg-neon-pink' : 'bg-neon-cyan'
            }`}
          />
        ))}
      </div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center z-10"
      >
        <div className="inline-block glass px-4 py-1 rounded-full border-neon-pink/30 text-neon-pink text-xs font-heading mb-6 tracking-widest uppercase animate-pulse">
          New Quest Unlocked
        </div>

        <h1 className="text-white font-heading text-5xl md:text-8xl mb-4 leading-tight">
          ABIDZAR <br />
          <span className="text-neon-yellow neon-glow-yellow">DANTE</span> <br />
          ALFARESI
        </h1>

        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[1px] w-12 bg-neon-cyan"></div>
          <Gamepad2 className="text-neon-cyan w-6 h-6" />
          <div className="h-[1px] w-12 bg-neon-cyan"></div>
        </div>

        <p className="text-white/80 max-w-md mx-auto mb-10 text-lg leading-relaxed">
          Kami mengundang Anda untuk merayakan momen spesial tasyakuran khitan putra kami tercinta.
        </p>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-10"
        >
          <ChevronDown className="w-8 h-8 text-white/30" />
        </motion.div>
      </motion.div>

      {/* Floating Gaming Symbols */}
      <div className="absolute top-1/4 left-10 opacity-20 hidden md:block">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="text-neon-cyan text-4xl">□</motion.div>
      </div>
      <div className="absolute top-1/3 right-10 opacity-20 hidden md:block">
        <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-neon-pink text-4xl">△</motion.div>
      </div>
    </section>
  );
};
