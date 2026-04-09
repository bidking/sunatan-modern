import React from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react';
import { Countdown } from './Countdown';
import { Button } from './ui/button';

export const EventDetails: React.FC = () => {
  const eventDate = new Date('2024-12-24T10:00:00');

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
                  <p className="text-white font-medium text-lg">Sabtu, 24 Desember 2024</p>
                  <p className="text-white/60 text-sm">Save the date on your calendar</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-neon-pink mt-1 shrink-0" />
                <div>
                  <p className="text-white font-medium text-lg">10.00 – 13.00 WIB</p>
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
                  <p className="text-white font-medium text-lg">Komplek INALUM Tanjung Gading</p>
                  <p className="text-white/60 text-sm">Batu Bara, Sumatera Utara</p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-gaming-dark font-heading"
                onClick={() => window.open('https://maps.google.com/?q=Komplek+INALUM+Tanjung+Gading', '_blank')}
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
          className="mt-12 rounded-3xl overflow-hidden border border-white/10 h-80 relative"
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.6!2d99.3!3d3.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM8KwMTgnMDAuMCJOIDk5wrAxOCcwMC4wIkU!5e0!3m2!1sen!2sid!4v1234567890"
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
