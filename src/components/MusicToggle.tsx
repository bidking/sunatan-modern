import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MusicToggleProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export const MusicToggle: React.FC<MusicToggleProps> = ({ isPlaying, onToggle }) => {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className={`fixed bottom-28 left-6 z-50 w-12 h-12 rounded-full flex items-center justify-center glass border-neon-yellow/50 text-neon-yellow shadow-lg shadow-neon-yellow/20`}
    >
      <AnimatePresence mode="wait">
        {isPlaying ? (
          <motion.div
            key="playing"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
          >
            <Volume2 className="w-6 h-6" />
          </motion.div>
        ) : (
          <motion.div
            key="muted"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
          >
            <VolumeX className="w-6 h-6" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {isPlaying && (
        <div className="absolute -inset-1 rounded-full border border-neon-yellow animate-ping opacity-20"></div>
      )}
    </motion.button>
  );
};
