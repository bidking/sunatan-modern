/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageCircle, ArrowUp } from 'lucide-react';
import { OpeningScreen } from './components/OpeningScreen';
import { Hero } from './components/Hero';
import { Profile } from './components/Profile';
import { EventDetails } from './components/EventDetails';
import { RSVPSection } from './components/RSVPSection';
import { Gallery } from './components/Gallery';
import { GiftSection } from './components/GiftSection';
import { Footer } from './components/Footer';
import { MusicToggle } from './components/MusicToggle';
import { FloatingNav } from './components/FloatingNav';
import { BackgroundElements } from './components/BackgroundElements';
import { LoadingScreen } from './components/LoadingScreen';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [isAdminPath, setIsAdminPath] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if we are on admin path
    setIsAdminPath(window.location.pathname === '/admin');

    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    // Get guest name from URL
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    if (to) {
      // Convert slug back to name (e.g., pak-andra -> Pak Andra)
      const formattedName = to.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      setGuestName(formattedName);
    }

    // Scroll listener for scroll-to-top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log("Autoplay blocked:", err));
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (isAdminPath) {
    return <AdminDashboard />;
  }

  return (
    <div className="relative min-h-screen bg-gaming-dark text-white selection:bg-neon-yellow selection:text-gaming-dark">
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>

      <div className="gaming-bg"></div>
      <BackgroundElements />
      
      <audio 
        ref={audioRef} 
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
        loop 
      />

      <AnimatePresence>
        {!isOpen && (
          <OpeningScreen onOpen={handleOpen} guestName={guestName} />
        )}
      </AnimatePresence>

      {isOpen && (
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Hero guestName={guestName} />
          <Profile />
          <EventDetails />
          <Gallery />
          <RSVPSection />
          <GiftSection />
          <Footer />

          <FloatingNav />
          <MusicToggle isPlaying={isPlaying} onToggle={toggleMusic} />

          {/* WhatsApp Floating Button */}
          <motion.a
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            href="https://wa.me/6281234567890?text=Halo! Saya akan hadir di acara tasyakuran khitan Keyanu Azzam."
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-44 left-6 z-50 w-12 h-12 rounded-full flex items-center justify-center bg-green-500 text-white shadow-lg shadow-green-500/20"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.a>

          {/* Scroll to Top Button */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-28 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center glass border-neon-cyan/50 text-neon-cyan shadow-lg shadow-neon-cyan/20"
              >
                <ArrowUp className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.main>
      )}
    </div>
  );
}

