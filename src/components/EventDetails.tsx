import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { Countdown } from './Countdown';
import { Button } from '@/components/ui/button';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const EventDetails: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const eventDate = settings?.eventDate ? new Date(settings.eventDate + 'T' + (settings.eventTime?.split(' ')[0] || '10:00')) : new Date('2026-06-06T10:00:00');
  const displayDate = settings?.eventDate ? new Date(settings.eventDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Sabtu, 06 Juni 2026';
  const displayTime = settings?.eventTime || '10.00 – Selesai';
  const displayAddress = settings?.address || 'Jl. Lanbau, Karang Asem Bar., Kec. Citeureup, Kabupaten Bogor, Jawa Barat, Indonesia';
  const mapUrl = settings?.mapUrl || 'https://www.google.com/maps/search/?api=1&query=-6.4822237,106.8679418';
  
  // Use manual Coordinates if provided
  const getEmbedUrl = () => {
    if (settings?.coordinates) {
      // Clean the coordinates string (handle if user uses comma as decimal)
      // Example: "-6,48233, 106,86785" -> "-6.48233, 106.86785"
      const cleanCoords = settings.coordinates.replace(/(\d+),(\d+)/g, '$1.$2');
      const parts = cleanCoords.split(',').map((p: string) => p.trim());
      
      if (parts.length >= 2) {
        return `https://maps.google.com/maps?q=${parts[0]},${parts[1]}&hl=id&z=15&output=embed`;
      }
    }
    
    const url = settings?.mapUrl;
    if (!url) return "https://maps.google.com/maps?q=-6.4822237,106.8679418&hl=id&z=15&output=embed";
    
    // Fallback logic for old URL formats
    if (url.includes('output=embed')) return url;
    const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&hl=id&z=15&output=embed`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&hl=id&z=15&output=embed`;
  };

  const embedMapUrl = getEmbedUrl();

  return (
    <section id="event" className="py-20 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-white font-heading text-3xl md:text-5xl mb-10">
            SAVE THE <span className="text-neon-cyan neon-glow-cyan">DATE</span>
          </h2>
          <Countdown targetDate={eventDate} />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Date & Time Card */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="glass p-8 rounded-3xl border-neon-pink/30 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Calendar className="w-24 h-24 text-neon-pink" />
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-neon-pink/20 text-neon-pink">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-white font-heading text-xl">Waktu & Tanggal</h3>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-neon-pink mt-1 shrink-0" />
                <div>
                  <p className="text-white font-medium text-lg">{displayDate}</p>
                  <p className="text-white/60 text-sm">Save the date on your calendar</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-neon-pink mt-1 shrink-0" />
                <div>
                  <p className="text-white font-medium text-lg">{displayTime}</p>
                  <p className="text-white/60 text-sm">Don't be late for the quest!</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Location Card */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="glass p-8 rounded-3xl border-neon-cyan/30 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <MapPin className="w-24 h-24 text-neon-cyan" />
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-neon-cyan/20 text-neon-cyan">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-white font-heading text-xl">Lokasi Acara</h3>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-neon-cyan mt-1 shrink-0" />
                <div>
                  <p className="text-white font-medium text-lg">Kediaman Kami (Rumah)</p>
                  <p className="text-white/70 text-sm leading-relaxed mt-1">
                    {displayAddress}
                  </p>
                  <p className="text-white/40 text-xs mt-2 italic">Klik tombol di bawah untuk navigasi</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-gaming-dark font-heading"
                onClick={() => window.open(mapUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                LIHAT MAPS
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Embedded Map */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 rounded-3xl overflow-hidden border border-white/10 h-[450px] relative"
        >
          <iframe
            src={embedMapUrl}
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.8)' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          <div className="absolute inset-0 pointer-events-none border-4 border-neon-cyan/20 rounded-3xl"></div>
        </motion.div>
      </div>
    </section>
  );
};
