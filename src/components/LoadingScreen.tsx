import React from 'react';
import { motion } from 'motion/react';
import { Gamepad2 } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[200] bg-gaming-dark flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="gaming-grid"></div>
      
      <div className="relative mb-8">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 4, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-24 h-24 rounded-full border-4 border-t-neon-cyan border-r-neon-pink border-b-neon-yellow border-l-white opacity-20"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Gamepad2 className="w-10 h-10 text-white animate-bounce" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h2 className="text-white font-heading text-xl tracking-[0.3em] mb-4">
          LOADING<span className="animate-pulse">...</span>
        </h2>
        
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-neon-cyan to-transparent"
          />
        </div>
        
        <p className="text-white/40 text-[10px] font-heading mt-4 tracking-widest uppercase">
          Initializing Quest
        </p>
      </motion.div>

      {/* Background symbols for flavor */}
      <div className="absolute top-10 left-10 text-neon-pink/20 text-4xl animate-spin-slow">△</div>
      <div className="absolute bottom-10 right-10 text-neon-cyan/20 text-4xl animate-bounce">□</div>
    </motion.div>
  );
};
