import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Copy, 
  ExternalLink, 
  LogOut, 
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

interface GuestData {
  id: string;
  name: string;
  slug: string;
  createdAt: Timestamp;
}

export const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const ADMIN_EMAIL = "estabantu5@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        fetchGuests();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchGuests = async () => {
    try {
      const q = query(collection(db, 'guests'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const guestList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GuestData[];
      setGuests(guestList);
    } catch (error) {
      console.error("Error fetching guests:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setGuests([]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const addGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim() || isAdding) return;

    setIsAdding(true);
    try {
      const slug = newGuestName.trim().toLowerCase().replace(/\s+/g, '-');
      await addDoc(collection(db, 'guests'), {
        name: newGuestName.trim(),
        slug: slug,
        createdAt: serverTimestamp()
      });
      setNewGuestName('');
      fetchGuests();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'guests');
    } finally {
      setIsAdding(false);
    }
  };

  const deleteGuest = async (id: string) => {
    if (!window.confirm("Hapus tamu ini?")) return;
    try {
      await deleteDoc(doc(db, 'guests', id));
      fetchGuests();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `guests/${id}`);
    }
  };

  const copyLink = (slug: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/?to=${encodeURIComponent(slug)}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(slug);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gaming-dark flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-neon-cyan animate-spin" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gaming-dark flex items-center justify-center px-6">
        <div className="glass p-8 rounded-2xl border-white/10 max-w-md w-full text-center">
          <Users className="w-16 h-16 text-neon-cyan mx-auto mb-6" />
          <h1 className="text-2xl font-heading mb-2">Admin Dashboard</h1>
          <p className="text-white/60 mb-8">Silakan login dengan akun admin untuk mengelola tamu.</p>
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-neon-cyan text-gaming-dark font-heading rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2"
          >
            Login with Google
          </button>
          {user && user.email !== ADMIN_EMAIL && (
            <p className="text-neon-pink text-xs mt-4">
              Akses ditolak. Email {user.email} bukan admin.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gaming-dark text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-heading mb-2">Guest Manager</h1>
            <p className="text-white/60">Kelola daftar tamu dan link undangan personal.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 glass px-4 py-2 rounded-full border-white/10">
              <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border border-neon-cyan" alt="Admin" />
              <span className="text-sm font-medium hidden sm:inline">{user.displayName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-white/40 hover:text-neon-pink transition-colors"
              title="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Guest Form */}
          <div className="lg:col-span-1">
            <div className="glass p-6 rounded-2xl border-white/10 sticky top-10">
              <h2 className="text-xl font-heading mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-neon-cyan" />
                Tambah Tamu
              </h2>
              <form onSubmit={addGuest} className="space-y-4">
                <div>
                  <label className="block text-xs font-heading text-white/40 uppercase mb-2">Nama Tamu</label>
                  <input
                    type="text"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    placeholder="Contoh: Pak Andra"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAdding || !newGuestName.trim()}
                  className="w-full py-3 bg-neon-cyan text-gaming-dark font-heading rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  Simpan Tamu
                </button>
              </form>
            </div>
          </div>

          {/* Guest List */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between gap-4">
                <h2 className="text-xl font-heading flex items-center gap-2">
                  <Users className="w-5 h-5 text-neon-cyan" />
                  Daftar Tamu ({guests.length})
                </h2>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama..."
                    className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-neon-cyan transition-colors"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-heading text-white/40 uppercase border-b border-white/5">
                      <th className="px-6 py-4">Nama Tamu</th>
                      <th className="px-6 py-4">Link Undangan</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredGuests.length > 0 ? (
                      filteredGuests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-medium">{guest.name}</div>
                            <div className="text-[10px] text-white/30 uppercase mt-1">
                              {guest.createdAt?.toDate().toLocaleDateString('id-ID', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <code className="text-xs text-neon-cyan bg-neon-cyan/10 px-2 py-1 rounded">
                                ?to={guest.slug}
                              </code>
                              <button
                                onClick={() => copyLink(guest.name)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
                                title="Copy Link"
                              >
                                {copySuccess === guest.name ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`/?to=${encodeURIComponent(guest.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-neon-cyan"
                                title="Buka Undangan"
                              >
                                <ExternalLink className="w-5 h-5" />
                              </a>
                              <button
                                onClick={() => deleteGuest(guest.id)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-neon-pink"
                                title="Hapus"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-3 text-white/20">
                            <Users className="w-12 h-12" />
                            <p>Belum ada daftar tamu.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
