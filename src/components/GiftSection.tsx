import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Gift, Copy, Check, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const GiftSection: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const accounts = [
    { bank: 'BANK MANDIRI', number: '1234567890', name: 'Bapak Fulan' },
    { bank: 'BANK BRI', number: '0987654321', name: 'Ibu Fulanah' },
  ];

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(num);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section id="gift" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-yellow/20 text-neon-yellow mb-6">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="text-white font-heading text-3xl md:text-5xl mb-4">
            DIGITAL <span className="text-neon-yellow neon-glow-yellow">GIFT</span>
          </h2>
          <p className="text-white/60 max-w-lg mx-auto">
            Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika Anda ingin memberikan tanda kasih, dapat melalui:
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {accounts.map((acc, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass p-8 rounded-3xl border-neon-yellow/20 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <CreditCard className="w-20 h-20 text-white" />
              </div>
              
              <h3 className="text-neon-yellow font-heading text-lg mb-4">{acc.bank}</h3>
              <div className="space-y-1 mb-6">
                <p className="text-white font-heading text-2xl tracking-wider">{acc.number}</p>
                <p className="text-white/60 text-sm italic">a.n {acc.name}</p>
              </div>

              <Button
                variant="outline"
                className="w-full border-neon-yellow/50 text-neon-yellow hover:bg-neon-yellow hover:text-gaming-dark font-heading"
                onClick={() => handleCopy(acc.number)}
              >
                {copied === acc.number ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    COPIED
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    SALIN NOMOR
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
