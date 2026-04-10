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
  Loader2,
  Settings as SettingsIcon,
  MessageSquare,
  Save,
  MapPin,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  User as UserIcon,
  Upload,
  Link as LinkIcon
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
  Timestamp,
  setDoc,
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { ImageUpload } from './ImageUpload';

interface GuestData {
  id: string;
  name: string;
  slug: string;
  createdAt: Timestamp;
}

interface RSVPData {
  id: string;
  name: string;
  attendance: string;
  message: string;
  timestamp: any;
}

interface GlobalSettings {
  childName: string;
  fatherName: string;
  motherName: string;
  eventDate: string;
  eventTime: string;
  address: string;
  mapUrl: string;
  heroImage: string;
  profileImage: string;
  gallery: string[];
}

export const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'guests' | 'rsvps' | 'settings'>('guests');
  
  // Guests State
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // RSVPs State
  const [rsvps, setRsvps] = useState<RSVPData[]>([]);

  // Settings State
  const [settings, setSettings] = useState<GlobalSettings>({
    childName: 'Keyanu Azzam Azahab',
    fatherName: 'Bapak Nama',
    motherName: 'Ibu Nama',
    eventDate: '2026-05-20',
    eventTime: '08:00 - Selesai',
    address: 'Jl. Contoh Alamat No. 123, Jakarta',
    mapUrl: 'https://goo.gl/maps/...',
    heroImage: 'https://picsum.photos/seed/gaming/1920/1080',
    profileImage: 'https://picsum.photos/seed/boy/800/800',
    gallery: [
      'https://picsum.photos/seed/1/800/600',
      'https://picsum.photos/seed/2/800/600',
      'https://picsum.photos/seed/3/800/600',
      'https://picsum.photos/seed/4/800/600',
      'https://picsum.photos/seed/5/800/600',
      'https://picsum.photos/seed/6/800/600'
    ]
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  const ADMIN_EMAIL = "estabantu5@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        fetchGuests();
        fetchRSVPs();
        fetchSettings();
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

  const fetchRSVPs = () => {
    const q = query(collection(db, 'rsvps'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const rsvpList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RSVPData[];
      setRsvps(rsvpList);
    });
  };

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as GlobalSettings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
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
      setRsvps([]);
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

  const deleteRSVP = async (id: string) => {
    if (!window.confirm("Hapus komentar/RSVP ini?")) return;
    try {
      await deleteDoc(doc(db, 'rsvps', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `rsvps/${id}`);
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      alert("Pengaturan berhasil disimpan!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const copyLink = (name: string) => {
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-');
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/?to=${encodeURIComponent(slug)}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(name);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const addGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    if (settings.gallery.length >= 10) {
      alert("Maksimal 10 foto di galeri.");
      return;
    }
    setSettings({
      ...settings,
      gallery: [...settings.gallery, newGalleryUrl.trim()]
    });
    setNewGalleryUrl('');
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = [...settings.gallery];
    newGallery.splice(index, 1);
    setSettings({ ...settings, gallery: newGallery });
  };

  const updateGalleryImage = (index: number, url: string) => {
    const newGallery = [...settings.gallery];
    newGallery[index] = url;
    setSettings({ ...settings, gallery: newGallery });
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
          <p className="text-white/60 mb-8">Silakan login dengan akun admin untuk mengelola undangan.</p>
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-neon-cyan text-gaming-dark font-heading rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2"
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gaming-dark text-white p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-heading mb-2">Admin Panel</h1>
            <p className="text-white/60">Kelola tamu, komentar, dan konten undangan.</p>
          </div>
          <div className="flex items-center justify-center md:justify-end gap-4">
            <div className="flex items-center gap-3 glass px-4 py-2 rounded-full border-white/10">
              <img src={user.photoURL || ''} className="w-8 h-8 rounded-full border border-neon-cyan" alt="Admin" />
              <span className="text-sm font-medium hidden sm:inline">{user.displayName}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-white/40 hover:text-neon-pink transition-colors">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-8 bg-white/5 p-1 rounded-xl w-full md:w-fit no-scrollbar">
          {[
            { id: 'guests', label: 'Tamu', icon: Users },
            { id: 'rsvps', label: 'Komentar', icon: MessageSquare },
            { id: 'settings', label: 'Pengaturan', icon: SettingsIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg font-heading text-[10px] md:text-xs uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-neon-cyan text-gaming-dark' : 'text-white/60 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'guests' && (
            <motion.div
              key="guests"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-1">
                <div className="glass p-6 rounded-2xl border-white/10 sticky top-10">
                  <h2 className="text-xl font-heading mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-neon-cyan" />
                    Tambah Tamu
                  </h2>
                  <form onSubmit={addGuest} className="space-y-4">
                    <input
                      type="text"
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      placeholder="Nama Tamu..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={isAdding || !newGuestName.trim()}
                      className="w-full py-3 bg-neon-cyan text-gaming-dark font-heading rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2"
                    >
                      {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                      Simpan
                    </button>
                  </form>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="glass rounded-2xl border-white/10 overflow-hidden">
                  <div className="p-6 border-b border-white/10 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-heading">Daftar Tamu</h2>
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari..."
                        className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm"
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <tbody className="divide-y divide-white/5">
                        {filteredGuests.map((guest) => (
                          <tr key={guest.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 md:px-6 py-4 font-medium">{guest.name}</td>
                            <td className="px-4 md:px-6 py-4 text-[10px] md:text-xs text-neon-cyan">?to={guest.slug}</td>
                            <td className="px-4 md:px-6 py-4 text-right flex justify-end gap-2">
                              <button onClick={() => copyLink(guest.name)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white">
                                {copySuccess === guest.name ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                              <button onClick={() => deleteGuest(guest.id)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-neon-pink">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rsvps' && (
            <motion.div
              key="rsvps"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass rounded-2xl border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-heading">Komentar & RSVP</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="text-[10px] md:text-xs font-heading text-white/40 uppercase border-b border-white/5">
                      <th className="px-4 md:px-6 py-4 text-left">Tamu</th>
                      <th className="px-4 md:px-6 py-4 text-left">Status</th>
                      <th className="px-4 md:px-6 py-4 text-left">Pesan</th>
                      <th className="px-4 md:px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rsvps.map((rsvp) => (
                      <tr key={rsvp.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 md:px-6 py-4 font-medium">{rsvp.name}</td>
                        <td className="px-4 md:px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-heading ${
                            rsvp.attendance === 'present' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {rsvp.attendance === 'present' ? 'Hadir' : 'Absen'}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-white/60 max-w-[150px] md:max-w-xs truncate">{rsvp.message}</td>
                        <td className="px-4 md:px-6 py-4 text-right">
                          <button onClick={() => deleteRSVP(rsvp.id)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-neon-pink">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass p-8 rounded-2xl border-white/10"
            >
              <form onSubmit={saveSettings} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Data Anak */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-heading text-neon-cyan flex items-center gap-2">
                      <UserIcon className="w-4 h-4" /> Data Utama
                    </h3>
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">Nama Lengkap Anak</label>
                      <input
                        type="text"
                        value={settings.childName}
                        onChange={(e) => setSettings({...settings, childName: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-cyan outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">Nama Ayah</label>
                      <input
                        type="text"
                        value={settings.fatherName}
                        onChange={(e) => setSettings({...settings, fatherName: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-cyan outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">Nama Ibu</label>
                      <input
                        type="text"
                        value={settings.motherName}
                        onChange={(e) => setSettings({...settings, motherName: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-cyan outline-none"
                      />
                    </div>
                  </div>

                  {/* Waktu & Lokasi */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-heading text-neon-cyan flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" /> Waktu & Lokasi
                    </h3>
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">Tanggal Acara</label>
                      <input
                        type="date"
                        value={settings.eventDate}
                        onChange={(e) => setSettings({...settings, eventDate: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-cyan outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">Alamat Lengkap</label>
                      <textarea
                        value={settings.address}
                        onChange={(e) => setSettings({...settings, address: e.target.value})}
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-cyan outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1">Google Maps URL</label>
                      <input
                        type="text"
                        value={settings.mapUrl}
                        onChange={(e) => setSettings({...settings, mapUrl: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-cyan outline-none"
                      />
                    </div>
                  </div>

                  {/* Media */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-sm font-heading text-neon-cyan flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Media & Foto
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ImageUpload
                        label="Hero Image"
                        value={settings.heroImage}
                        onChange={(url) => setSettings({...settings, heroImage: url})}
                      />
                      <ImageUpload
                        label="Profile Image"
                        value={settings.profileImage}
                        onChange={(url) => setSettings({...settings, profileImage: url})}
                      />
                    </div>
                  </div>

                  {/* Galeri Foto */}
                  <div className="md:col-span-2 space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-sm font-heading text-neon-cyan flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Galeri Foto (Maks 10)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {settings.gallery.map((url, index) => (
                        <div key={index} className="glass p-3 rounded-xl border-white/10 relative group">
                          <ImageUpload
                            label={`Foto ${index + 1}`}
                            value={url}
                            onChange={(newUrl) => updateGalleryImage(index, newUrl)}
                          />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {settings.gallery.length < 10 && (
                        <div className="glass p-4 rounded-xl border-dashed border-white/20 flex flex-col gap-3 min-h-[150px]">
                          <ImageUpload
                            label="Tambah Foto Baru"
                            value={newGalleryUrl}
                            onChange={(url) => setNewGalleryUrl(url)}
                          />
                          <button
                            type="button"
                            onClick={addGalleryImage}
                            disabled={!newGalleryUrl}
                            className="w-full py-2 bg-neon-cyan text-gaming-dark text-xs font-heading rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" /> Konfirmasi Tambah
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="px-10 py-3 bg-neon-cyan text-gaming-dark font-heading rounded-xl hover:bg-white transition-all flex items-center gap-2"
                  >
                    {isSavingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
