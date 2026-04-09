import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, addDoc, onSnapshot, query, orderBy, updateDoc, doc, arrayUnion, arrayRemove, increment, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { RSVP } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Heart, Send, User, Clock, CheckCircle2, XCircle, Gamepad2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export const RSVPSection: React.FC = () => {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState<'present' | 'absent'>('present');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Simple userId for likes tracking
    let storedId = localStorage.getItem('abidzar_invitation_uid');
    if (!storedId) {
      storedId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('abidzar_invitation_uid', storedId);
    }
    setUserId(storedId);

    // Real-time listener
    const q = query(collection(db, 'rsvps'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RSVP[];
      setRsvps(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'rsvps');
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'rsvps'), {
        name,
        attendance,
        message,
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: []
      });
      setName('');
      setMessage('');
      // Show success toast or something (omitted for brevity)
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'rsvps');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (rsvp: RSVP) => {
    if (!rsvp.id || !userId) return;

    const isLiked = rsvp.likedBy.includes(userId);
    const rsvpRef = doc(db, 'rsvps', rsvp.id);

    try {
      await updateDoc(rsvpRef, {
        likes: increment(isLiked ? -1 : 1),
        likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rsvps/${rsvp.id}`);
    }
  };

  return (
    <section id="rsvp" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-white font-heading text-3xl md:text-5xl mb-4">
            RSVP & <span className="text-neon-yellow neon-glow-yellow">WISHES</span>
          </h2>
          <p className="text-white/60">Berikan doa dan ucapan terbaik Anda untuk Abidzar</p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Form */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <Card className="glass border-neon-yellow/30">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-white/70 text-sm font-heading mb-2 block">Nama Lengkap</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama Anda"
                      className="bg-white/5 border-white/10 text-white focus:border-neon-yellow"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-white/70 text-sm font-heading mb-2 block">Kehadiran</label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={attendance === 'present' ? 'default' : 'outline'}
                        onClick={() => setAttendance('present')}
                        className={attendance === 'present' ? 'bg-neon-yellow text-gaming-dark' : 'border-white/10 text-white'}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Hadir
                      </Button>
                      <Button
                        type="button"
                        variant={attendance === 'absent' ? 'default' : 'outline'}
                        onClick={() => setAttendance('absent')}
                        className={attendance === 'absent' ? 'bg-neon-pink text-white' : 'border-white/10 text-white'}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Absen
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-white/70 text-sm font-heading mb-2 block">Ucapan & Doa</label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tuliskan pesan Anda..."
                      className="bg-white/5 border-white/10 text-white focus:border-neon-yellow min-h-[120px]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-neon-cyan text-gaming-dark hover:bg-neon-cyan/80 font-heading py-6 rounded-xl neon-border-cyan"
                  >
                    {isSubmitting ? 'MENGIRIM...' : 'KIRIM UCAPAN'}
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Comments List */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="glass rounded-3xl border-white/10 h-[600px] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <h3 className="text-white font-heading text-sm uppercase tracking-widest">
                  Live Comments ({rsvps.length})
                </h3>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {rsvps.map((rsvp) => (
                    <motion.div
                      key={rsvp.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/5 rounded-2xl p-4 border border-white/5 group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-neon-cyan/20 flex items-center justify-center text-neon-cyan">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-white font-heading text-xs">{rsvp.name}</p>
                            <div className="flex items-center gap-1 text-[10px] text-white/40">
                              <Clock className="w-3 h-3" />
                              {rsvp.timestamp ? formatDistanceToNow(rsvp.timestamp.toDate(), { addSuffix: true, locale: id }) : 'Baru saja'}
                            </div>
                          </div>
                        </div>
                        <div className={`text-[10px] px-2 py-0.5 rounded-full font-heading ${
                          rsvp.attendance === 'present' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {rsvp.attendance === 'present' ? 'HADIR' : 'ABSEN'}
                        </div>
                      </div>
                      
                      <p className="text-white/80 text-sm mb-3 leading-relaxed">
                        {rsvp.message}
                      </p>
                      
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleLike(rsvp)}
                          className={`flex items-center gap-1 text-xs transition-colors ${
                            rsvp.likedBy.includes(userId) ? 'text-neon-pink' : 'text-white/40 hover:text-white/60'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${rsvp.likedBy.includes(userId) ? 'fill-current' : ''}`} />
                          <span>{rsvp.likes}</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {rsvps.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-2">
                    <Gamepad2 className="w-12 h-12 opacity-20" />
                    <p>Belum ada ucapan. Jadilah yang pertama!</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
