import React from 'react';
import { motion } from 'motion/react';

export const Profile: React.FC = () => {
  return (
    <section id="profile" className="py-20 px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="relative inline-block mb-10">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-neon-yellow p-2 bg-gaming-dark relative z-10">
              <img 
                src="https://picsum.photos/seed/boy/400/400" 
                alt="Abidzar Dante Alfaresi" 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Glow effects */}
            <div className="absolute -inset-4 bg-neon-yellow/30 blur-2xl rounded-full -z-0"></div>
            <div className="absolute -inset-10 bg-neon-pink/10 blur-3xl rounded-full -z-10 animate-pulse"></div>
          </div>

          <h2 className="text-white font-heading text-3xl md:text-4xl mb-6">
            Sang Jagoan Kecil
          </h2>

          <div className="glass p-8 rounded-3xl border-neon-cyan/20 max-w-2xl mx-auto">
            <p className="text-white/90 text-lg italic mb-6 leading-relaxed">
              "Ya Allah, muliakanlah anak kami ini, panjangkanlah umurnya, terangilah hatinya, teguhkanlah imannya, perbaikilah amal perbuatannya, lapangkanlah rezekinya, dan dekatkanlah ia kepada kebaikan."
            </p>
            
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-neon-cyan to-transparent mb-6"></div>
            
            <div className="space-y-2">
              <h3 className="text-neon-yellow font-heading text-xl">Abidzar Dante Alfaresi</h3>
              <p className="text-white/70">Putra dari:</p>
              <p className="text-white font-medium text-lg">Bapak Fulan & Ibu Fulanah</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
