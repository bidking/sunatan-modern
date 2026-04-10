import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, Play, Trophy, Zap, Target, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OpeningScreenProps {
  onOpen: () => void;
  guestName: string;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({ onOpen, guestName }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -1000 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gaming-dark overflow-hidden"
    >
      <div className="gaming-grid"></div>
      
      {/* Background symbols & Icons */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-10 text-neon-pink text-6xl"
        >△</motion.div>
        <motion.div 
          animate={{ y: [0, 20, 0] }} 
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 right-20 text-neon-cyan text-6xl"
        >□</motion.div>
        <motion.div 
          animate={{ x: [0, 20, 0] }} 
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute bottom-20 left-1/4 text-neon-yellow text-6xl"
        >✕</motion.div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-1/3 right-1/4 text-white text-6xl"
        >○</motion.div>
        
        <Trophy className="absolute top-1/3 left-1/4 text-neon-yellow w-12 h-12 -rotate-12" />
        <Zap className="absolute top-2/3 right-1/3 text-neon-pink w-10 h-10 rotate-12" />
        <Target className="absolute top-1/2 right-10 text-neon-cyan w-16 h-16" />
        <Cpu className="absolute bottom-10 left-10 text-white w-14 h-14 opacity-50" />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center z-10 px-6"
      >
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Gamepad2 className="w-24 h-24 text-neon-yellow animate-pulse" />
            <div className="absolute -inset-4 bg-neon-yellow/20 blur-xl rounded-full -z-10"></div>
          </div>
        </div>

        <h2 className="text-neon-cyan font-heading text-xl mb-2 tracking-widest uppercase">
          Level Up Celebration
        </h2>
        <h1 className="text-white font-heading text-4xl md:text-6xl mb-6 neon-glow-yellow">
          TASYAKURAN KHITAN
        </h1>

        <div className="glass p-6 rounded-2xl mb-8 border-neon-cyan/30">
          <p className="text-white/70 text-sm mb-2">Kepada Yth:</p>
          <h3 className="text-white font-heading text-2xl mb-1">{guestName || 'Tamu Undangan'}</h3>
          <p className="text-white/50 text-xs italic">Di Tempat</p>
        </div>

        <Button
          onClick={onOpen}
          className="bg-neon-yellow text-gaming-dark hover:bg-neon-yellow/80 font-heading px-8 py-6 text-lg rounded-full neon-border-yellow transition-all duration-300 group"
        >
          <Play className="mr-2 fill-current group-hover:scale-110 transition-transform" />
          BUKA UNDANGAN
        </Button>
      </motion.div>

      {/* Footer decoration */}
      <div className="absolute bottom-10 flex gap-8 text-white/20 font-heading text-2xl">
        <span>✕</span>
        <span>○</span>
        <span>△</span>
        <span>□</span>
      </div>
    </motion.div>
  );
};
