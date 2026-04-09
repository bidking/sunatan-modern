import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-20 px-6 border-t border-white/10 relative overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-white font-heading text-2xl md:text-3xl mb-6">
            TERIMA <span className="text-neon-cyan neon-glow-cyan">KASIH</span>
          </h2>
          <p className="text-white/70 max-w-lg mx-auto mb-10 leading-relaxed">
            Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada putra kami.
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <p className="text-white/50 text-sm">Kami yang berbahagia,</p>
            <p className="text-white font-heading text-xl">Kel. Bapak Fulan & Ibu Fulanah</p>
          </div>

          <div className="mt-20 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-white/30 text-xs tracking-widest uppercase font-heading">
              Made with <Heart className="w-3 h-3 text-neon-pink fill-current" /> by Dante's Family
            </div>
            <div className="flex gap-4 text-white/10 font-heading text-xl">
              <span>✕</span>
              <span>○</span>
              <span>△</span>
              <span>□</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 bg-neon-cyan/5 blur-3xl rounded-full -z-10"></div>
    </footer>
  );
};
