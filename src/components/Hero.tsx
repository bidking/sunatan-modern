import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gamepad2, ChevronDown } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface HeroProps {
  guestName: string;
}

export const Hero: React.FC<HeroProps> = ({ guestName }) => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const childName = settings?.childName || 'KEYANU AZZAM AZAHAB';
  const heroImage = settings?.heroImage || 'https://picsum.photos/seed/gaming/1920/1080';

  // Split name for styling if it matches default or has spaces
  const nameParts = childName.split(' ');
  const firstName = nameParts[0] || 'KEYANU';
  const middleName = nameParts[1] || 'AZZAM';
  const lastName = nameParts.slice(2).join(' ') || 'AZAHAB';

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 px-6 overflow-hidden">
      {settings?.heroImage && (
        <div className="absolute inset-0 z-0 opacity-20">
          <img src={heroImage} className="w-full h-full object-cover" alt="Background" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-b from-gaming-dark via-transparent to-gaming-dark"></div>
        </div>
      )}
      
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

        <h1 className="text-white font-heading text-5xl md:text-8xl mb-4 leading-tight uppercase">
          {firstName} <br />
          <span className="text-neon-yellow neon-glow-yellow">{middleName}</span> <br />
          {lastName}
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
          className="mt-10 flex justify-center cursor-pointer"
          onClick={() => document.getElementById('profile')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronDown className="w-8 h-8 text-white/30 hover:text-white transition-colors" />
        </motion.div>
      </motion.div>
    </section>
  );
};
