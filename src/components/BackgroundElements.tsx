import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Gamepad2, Trophy, Sword, Zap, Target, Cpu, Headphones, Joystick } from 'lucide-react';

export const BackgroundElements: React.FC = () => {
  const symbols = ['△', '○', '✕', '□'];
  const colors = ['text-neon-pink', 'text-neon-cyan', 'text-neon-yellow', 'text-white'];
  
  const icons = [
    Gamepad2, Trophy, Sword, Zap, Target, Cpu, Headphones, Joystick
  ];

  // Stabilize random values to prevent re-clustering on re-renders
  const symbolData = useMemo(() => [...Array(12)].map(() => ({
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    opacity: 0.05 + Math.random() * 0.1,
    rotate: Math.random() * 360,
    duration: 10 + Math.random() * 20,
    moveY: (Math.random() - 0.5) * 200,
    moveRotate: Math.random() * 360
  })), []);

  const iconData = useMemo(() => icons.map((Icon, i) => ({
    Icon,
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    opacity: 0.03 + Math.random() * 0.07,
    scale: 0.8 + Math.random() * 0.5,
    duration: 15 + Math.random() * 25,
    moveX: (Math.random() - 0.5) * 150,
    moveY: (Math.random() - 0.5) * 150,
    color: colors[(i + 2) % colors.length],
    size: 40 + Math.random() * 40
  })), []);

  const particleData = useMemo(() => [...Array(30)].map(() => ({
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    opacity: Math.random() * 0.3,
    duration: 5 + Math.random() * 10,
    moveY: -100 - Math.random() * 200
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="gaming-grid"></div>
      
      {/* Floating Symbols */}
      {symbolData.map((data, i) => (
        <motion.div
          key={`symbol-${i}`}
          initial={{ 
            left: data.left, 
            top: data.top,
            opacity: data.opacity,
            rotate: data.rotate
          }}
          animate={{ 
            y: [0, data.moveY, 0],
            rotate: [data.rotate, data.rotate + data.moveRotate],
            opacity: [data.opacity, data.opacity * 2, data.opacity]
          }}
          transition={{ 
            duration: data.duration, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute font-heading text-4xl md:text-6xl ${colors[i % colors.length]}`}
        >
          {symbols[i % symbols.length]}
        </motion.div>
      ))}

      {/* Floating Icons */}
      {iconData.map((data, i) => (
        <motion.div
          key={`icon-${i}`}
          initial={{ 
            left: data.left, 
            top: data.top,
            opacity: data.opacity,
            scale: data.scale
          }}
          animate={{ 
            x: [0, data.moveX, 0],
            y: [0, data.moveY, 0],
            rotate: [0, 360],
            opacity: [data.opacity, data.opacity * 2, data.opacity]
          }}
          transition={{ 
            duration: data.duration, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute ${data.color}`}
        >
          <data.Icon size={data.size} strokeWidth={1} />
        </motion.div>
      ))}

      {/* Particles */}
      {particleData.map((data, i) => (
        <motion.div
          key={`particle-${i}`}
          initial={{ 
            left: data.left, 
            top: data.top,
            opacity: data.opacity
          }}
          animate={{ 
            y: [0, data.moveY],
            opacity: [data.opacity, data.opacity * 1.5, 0]
          }}
          transition={{ 
            duration: data.duration, 
            repeat: Infinity,
            ease: "linear"
          }}
          className={`absolute w-1 h-1 rounded-full ${
            i % 3 === 0 ? 'bg-neon-yellow' : i % 3 === 1 ? 'bg-neon-pink' : 'bg-neon-cyan'
          }`}
        />
      ))}
    </div>
  );
};
