import React from 'react';
import { motion } from 'motion/react';
import { Home, User, Calendar, Image, MessageSquare, Gift } from 'lucide-react';

export const FloatingNav: React.FC = () => {
  const navItems = [
    { icon: Home, label: 'Hero', href: '#hero' },
    { icon: User, label: 'Profile', href: '#profile' },
    { icon: Calendar, label: 'Event', href: '#event' },
    { icon: Image, label: 'Gallery', href: '#gallery' },
    { icon: MessageSquare, label: 'RSVP', href: '#rsvp' },
    { icon: Gift, label: 'Gift', href: '#gift' },
  ];

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 glass rounded-full border-white/20 shadow-2xl"
    >
      <ul className="flex items-center gap-6 md:gap-10">
        {navItems.map((item, index) => (
          <li key={index}>
            <a
              href={item.href}
              className="text-white/60 hover:text-neon-cyan transition-colors flex flex-col items-center gap-1 group"
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-heading uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                {item.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
};
