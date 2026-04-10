import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2 } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const Gallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const images = (settings?.gallery || []).filter((url: string) => url && url.trim() !== '');

  const childName = settings?.childName || '';
  const firstName = childName ? childName.split(' ')[0] : 'Putra Kami';

  if (images.length === 0 && !settings) return null;

  return (
    <section id="gallery" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-white font-heading text-3xl md:text-5xl mb-4">
            PHOTO <span className="text-neon-pink neon-glow-pink">GALLERY</span>
          </h2>
          <p className="text-white/60">Momen-momen bahagia {firstName}</p>
        </motion.div>

        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {images.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative group cursor-pointer rounded-2xl overflow-hidden border border-white/10"
              onClick={() => setSelectedImage(src)}
            >
              <img
                src={src}
                alt={`Gallery ${index}`}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gaming-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="text-white w-8 h-8" />
              </div>
              <div className="absolute inset-0 border-2 border-neon-pink/0 group-hover:border-neon-pink/50 transition-all rounded-2xl pointer-events-none"></div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-gaming-dark/95 backdrop-blur-xl flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border-2 border-neon-pink/30"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <button
                  className="absolute top-4 right-4 bg-neon-pink text-white p-2 rounded-full hover:scale-110 transition-transform"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="w-6 h-6" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
