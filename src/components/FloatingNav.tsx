import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Home, User, Calendar, Image, MessageSquare, Gift } from 'lucide-react';

export const FloatingNav: React.FC = () => {
  const [activeSection, setActiveSection] = useState('hero');

  const navItems = [
    { icon: Home, label: 'Hero', href: '#hero', id: 'hero' },
    { icon: User, label: 'Profile', href: '#profile', id: 'profile' },
    { icon: Calendar, label: 'Event', href: '#event', id: 'event' },
    { icon: Image, label: 'Gallery', href: '#gallery', id: 'gallery' },
    { icon: MessageSquare, label: 'RSVP', href: '#rsvp', id: 'rsvp' },
    { icon: Gift, label: 'Gift', href: '#gift', id: 'gift' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection('hero');
      }
    };

    const options = {
      root: null,
      rootMargin: '-30% 0px -30% 0px',
      threshold: [0, 0.1]
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);

    const timer = setTimeout(() => {
      navItems.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) observer.observe(element);
      });
    }, 500);

    window.addEventListener('scroll', handleScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 glass rounded-full border-white/20 shadow-2xl"
    >
      <ul className="flex items-center gap-6 md:gap-10">
        {navItems.map((item, index) => {
          const isActive = activeSection === item.id;
          return (
            <li key={index} className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex flex-col items-center gap-1 group cursor-pointer transition-all duration-300 ${
                  isActive ? 'text-neon-cyan scale-110' : 'text-white/60 hover:text-white'
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]' : ''}`} />
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute -inset-2 bg-neon-cyan/20 blur-md rounded-full -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </div>
                <span className={`text-[8px] font-heading uppercase tracking-tighter transition-all duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                } hidden md:block`}>
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 w-1 h-1 bg-neon-cyan rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
};
