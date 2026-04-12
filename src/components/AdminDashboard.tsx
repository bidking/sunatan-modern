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
  Link as LinkIcon,
  Gift,
  Music,
  Play,
  Pause,
  Volume2,
  Share2,
  Globe
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

interface DigitalGift {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  type: 'bank' | 'ewallet';
}

interface GlobalSettings {
  childName: string;
  fatherName: string;
  motherName: string;
  eventDate: string;
  eventTime: string;
  address: string;
  mapUrl: string;
  coordinates?: string;
  heroImage: string;
  profileImage: string;
  gallery: string[];
  gifts?: DigitalGift[];
  musicUrl?: string;
  musicTitle?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  faviconUrl?: string;
}

export const AdminDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'guests' | 'rsvps' | 'settings' | 'gifts' | 'music' | 'seo'>('guests');
  
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
    childName: '',
    fatherName: '',
    motherName: '',
    eventDate: '',
    eventTime: '',
    address: '',
    mapUrl: '',
    coordinates: '',
    heroImage: '',
    profileImage: '',
    gallery: [],
    gifts: [],
    musicUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    musicTitle: 'Default Music',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    faviconUrl: ''
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [status, setStatus] = useState<{message: string; type: 'success' | 'error' | 'info'} | null>(null);
  const previewAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const showStatus = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setStatus({ message, type });
    setTimeout(() => setStatus(null), 3000);
  };

  const ADMIN_EMAILS = ["estabantu5@gmail.com", "estaaliansyah@gmail.com"];

  useEffect(() => {
    let unsubscribeRSVPs: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser && ADMIN_EMAILS.includes(currentUser.email || '')) {
        fetchGuests();
        fetchSettings();
        // Clean up previous listener if any
        if (unsubscribeRSVPs) unsubscribeRSVPs();
        unsubscribeRSVPs = fetchRSVPs();
      } else {
        if (unsubscribeRSVPs) unsubscribeRSVPs();
        unsubscribeRSVPs = undefined;
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRSVPs) unsubscribeRSVPs();
    };
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
        const data = docSnap.data() as GlobalSettings;
        const gallery = [...(data.gallery || [])];
        while (gallery.length < 10) gallery.push('');
        setSettings({ 
          ...data, 
          gallery, 
          gifts: data.gifts || [],
          ogTitle: data.ogTitle || '',
          ogDescription: data.ogDescription || '',
          ogImage: data.ogImage || '',
          faviconUrl: data.faviconUrl || ''
        });
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
      showStatus("Pengaturan berhasil disimpan!", 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
      showStatus("Gagal menyimpan pengaturan.", 'error');
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

  const updateGalleryImage = (index: number, url: string) => {
    const newGallery = [...(settings.gallery || [])];
    while (newGallery.length < 10) newGallery.push('');
    newGallery[index] = url;
    setSettings({ ...settings, gallery: newGallery });
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = [...(settings.gallery || [])];
    newGallery[index] = '';
    setSettings({ ...settings, gallery: newGallery });
  };

  const addDigitalGift = () => {
    const newGifts = [...(settings.gifts || []), { bankName: '', accountNumber: '', accountHolder: '', type: 'bank' as const }];
    setSettings({ ...settings, gifts: newGifts });
  };

  const removeDigitalGift = (index: number) => {
    const newGifts = [...(settings.gifts || [])];
    newGifts.splice(index, 1);
    setSettings({ ...settings, gifts: newGifts });
  };

  const updateDigitalGift = (index: number, field: keyof DigitalGift, value: string) => {
    const newGifts = [...(settings.gifts || [])];
    newGifts[index] = { ...newGifts[index], [field]: value };
    setSettings({ ...settings, gifts: newGifts });
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingMusic(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setSettings({ ...settings, musicUrl: data.url, musicTitle: file.name });
      }
    } catch (error) {
      console.error("Music upload error:", error);
    } finally {
      setIsUploadingMusic(false);
    }
  };

  const togglePreview = () => {
    if (previewAudioRef.current) {
      if (previewPlaying) {
        previewAudioRef.current.pause();
      } else {
        previewAudioRef.current.play();
      }
      setPreviewPlaying(!previewPlaying);
    }
  };

  const filteredGuests = guests.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="min-h-screen bg-gaming-dark flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-neon-cyan animate-spin" />
      </div>
    );
  }

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return (
      <div className="min-h-screen bg-gaming-dark flex items-center justify-center px-6">
        <div className="glass p-8 rounded-2xl border-white/10 max-w-md w-full text-center">
          <Users className="w-16 h-16 text-neon-cyan mx-auto mb-6" />
          <h1 className="text-2xl font-heading mb-2">Admin Dashboard</h1>
          <p className="text-white/60 mb-8">Silakan login dengan akun admin untuk mengelola undangan.</p>
          <button onClick={handleLogin} className="w-full py-3 bg-neon-cyan text-gaming-dark font-heading rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2">
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gaming-dark text-white p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
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

        <div className="flex overflow-x-auto gap-2 mb-8 bg-white/5 p-1 rounded-xl w-full md:w-fit no-scrollbar">
          {[
            { id: 'guests', label: 'Tamu', icon: Users },
            { id: 'rsvps', label: 'Komentar', icon: MessageSquare },
            { id: 'settings', label: 'Pengaturan', icon: SettingsIcon },
            { id: 'gifts', label: 'Digital Gift', icon: Gift },
            { id: 'music', label: 'Music', icon: Music },
            { id: 'seo', label: 'SEO & Share', icon: Share2 },
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
            <motion.div key="guests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="glass p-6 rounded-2xl border-white/10 sticky top-10">
                  <h2 className="text-xl font-heading mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-neon-cyan" /> Tambah Tamu
                  </h2>
                  <form onSubmit={addGuest} className="space-y-4">
                    <input type="text" value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} placeholder="Nama Tamu..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-cyan transition-colors" />
                    <button type="submit" disabled={isAdding || !newGuestName.trim()} className="w-full py-3 bg-neon-cyan text-gaming-dark font-heading rounded-xl hover:bg-white transition-all flex items-center justify-center gap-2">
                       {isAdding ? (
                         <Loader2 key="adding-loader" className="w-5 h-5 animate-spin" />
                       ) : (
                         <Plus key="add-icon" className="w-5 h-5" />
                       )} Simpan
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
                      <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari..." className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm" />
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
                                 {copySuccess === guest.name ? (
                                   <CheckCircle2 key={`check-${guest.id}`} className="w-4 h-4 text-green-400" />
                                 ) : (
                                   <Copy key={`copy-${guest.id}`} className="w-4 h-4" />
                                 )}
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
            <motion.div key="rsvps" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass rounded-2xl border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10"><h2 className="text-xl font-heading">Komentar & RSVP</h2></div>
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
                          <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-heading ${rsvp.attendance === 'present' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {rsvp.attendance === 'present' ? 'Hadir' : 'Absen'}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-sm text-white/60 max-w-[150px] md:max-w-xs truncate">{rsvp.message}</td>
                        <td className="px-4 md:px-6 py-4 text-right">
                          <button onClick={() => deleteRSVP(rsvp.id)} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-neon-pink"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass p-8 rounded-2xl border-white/10">
              <form onSubmit={saveSettings} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-heading text-neon-cyan flex items-center gap-2"><UserIcon className="w-4 h-4" /> Data Utama</h3>
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold">Nama Lengkap Anak</label>
                      <input type="text" value={settings.childName} onChange={(e) => setSettings({...settings, childName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-cyan outline-none text-white" placeholder="Wahid Ananda Putra Dua" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold">Nama Ayah (Tanpa Bpk.)</label>
                        <input type="text" value={settings.fatherName} onChange={(e) => setSettings({...settings, fatherName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-cyan outline-none text-white text-sm" placeholder="Esta Aliansyah" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold">Nama Ibu (Tanpa Ibu)</label>
                        <input type="text" value={settings.motherName} onChange={(e) => setSettings({...settings, motherName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-cyan outline-none text-white text-sm" placeholder="Nama Ibu" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-heading text-neon-cyan flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Waktu & Lokasi</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold">Tanggal Acara</label>
                        <input type="date" value={settings.eventDate} onChange={(e) => setSettings({...settings, eventDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-cyan outline-none text-white text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold">Waktu Acara</label>
                        <input type="text" value={settings.eventTime} onChange={(e) => setSettings({...settings, eventTime: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-cyan outline-none text-white text-sm" placeholder="10.00 – Selesai" />
                      </div>
                    </div>
                    <div className="space-y-4 pt-2 border-t border-white/5">
                      <div className="space-y-2">
                        <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold tracking-wider">Google Maps URL</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input type="text" value={settings.mapUrl} onChange={(e) => setSettings({...settings, mapUrl: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-cyan outline-none text-white text-xs" placeholder="https://maps.app.goo.gl/..." />
                          <button type="button" onClick={async () => {
                            const url = settings.mapUrl; if (!url) return;
                            try {
                              const res = await fetch('/api/resolve-map', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
                              const data = await res.json();
                              if (data.address) { setSettings(prev => ({ ...prev, address: data.address, coordinates: prev.coordinates || data.coordinates || '' })); showStatus("Alamat berhasil ditemukan!", 'success'); }
                              else { showStatus("Tidak dapat menemukan alamat.", 'error'); }
                            } catch (error) { showStatus("Terjadi kesalahan teknis.", 'error'); }
                          }} className="px-4 py-2.5 bg-neon-cyan/10 hover:bg-neon-cyan text-neon-cyan hover:text-gaming-dark text-[10px] font-heading rounded-xl transition-all border border-neon-cyan/20 whitespace-nowrap uppercase tracking-widest shadow-lg shadow-neon-cyan/5">Cek Alamat</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold">Alamat Lengkap</label>
                        <textarea value={settings.address} onChange={(e) => setSettings({...settings, address: e.target.value})} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-cyan outline-none resize-none text-white text-sm" placeholder="Isi alamat lengkap di sini..." />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold tracking-wider flex justify-between">Koordinat (Lat, Long)<span className="text-[9px] lowercase italic text-neon-cyan opacity-50">Auto-filled from map check</span></label>
                        <input type="text" value={settings.coordinates} onChange={(e) => setSettings({...settings, coordinates: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-cyan outline-none text-white text-xs" placeholder="Contoh: -6.48233, 106.86785" />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-4 pt-4 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ImageUpload label="Hero Image" value={settings.heroImage} onChange={(url) => setSettings({...settings, heroImage: url})} />
                      <ImageUpload label="Profile Image" value={settings.profileImage} onChange={(url) => setSettings({...settings, profileImage: url})} />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between"><h3 className="text-sm font-heading text-neon-cyan flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Galeri Foto (10 Slot)</h3></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Array.from({ length: 10 }).map((_, index) => {
                        const url = settings.gallery[index] || '';
                        return (
                          <div key={index} className="relative group">
                            <ImageUpload label={`Slot Galeri ${index + 1}`} value={url} onChange={(newUrl) => updateGalleryImage(index, newUrl)} />
                            {url && <button type="button" onClick={() => removeGalleryImage(index)} className="absolute top-8 right-12 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20" title="Hapus Foto"><Trash2 className="w-3 h-3" /></button>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-6 border-t border-white/10">
                  <button type="submit" disabled={isSavingSettings} className="px-10 py-3 bg-neon-cyan text-gaming-dark font-heading rounded-xl hover:bg-white transition-all flex items-center gap-2">
                    {isSavingSettings ? <Loader2 key="settings-loader" className="w-5 h-5 animate-spin" /> : <Save key="settings-save" className="w-5 h-5" />} Simpan Perubahan
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'gifts' && (
            <motion.div key="gifts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass p-8 rounded-2xl border-white/10">
              <form onSubmit={saveSettings} className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-heading text-neon-yellow flex items-center gap-2"><Gift className="w-5 h-5" /> Digital Gift</h3>
                  <button type="button" onClick={addDigitalGift} className="flex items-center gap-2 px-4 py-2 bg-neon-yellow/10 hover:bg-neon-yellow text-neon-yellow hover:text-gaming-dark text-xs font-heading rounded-xl transition-all border border-neon-yellow/20"><Plus className="w-4 h-4" /> Tambah Rekening</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {(settings.gifts || []).map((gift, index) => (
                    <div key={index} className="glass p-6 rounded-2xl border-white/5 relative group">
                      <button type="button" onClick={() => removeDigitalGift(index)} className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-10"><Trash2 className="w-4 h-4" /></button>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold">Jenis</label>
                            <select value={gift.type} onChange={(e) => updateDigitalGift(index, 'type', e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-neon-yellow"><option value="bank" className="bg-gaming-dark">Bank</option><option value="ewallet" className="bg-gaming-dark">E-Wallet</option></select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold">Nama Bank/E-Wallet</label>
                            <input type="text" value={gift.bankName} onChange={(e) => updateDigitalGift(index, 'bankName', e.target.value)} placeholder="BCA / DANA / OVO" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-neon-yellow" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold">Nomor Rekening/HP</label>
                            <input type="text" value={gift.accountNumber} onChange={(e) => updateDigitalGift(index, 'accountNumber', e.target.value)} placeholder="0012345678" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-neon-yellow font-mono" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold">Atas Nama</label>
                            <input type="text" value={gift.accountHolder} onChange={(e) => updateDigitalGift(index, 'accountHolder', e.target.value)} placeholder="Nama pemilik rekening..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-neon-yellow" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {(settings.gifts || []).length === 0 && (<div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl"><Gift className="w-12 h-12 text-white/10 mx-auto mb-4" /><p className="text-white/40 font-heading">Belum ada data hadiah digital.</p></div>)}
                <div className="flex justify-end pt-8 border-t border-white/10">
                  <button type="submit" disabled={isSavingSettings} className="px-10 py-3 bg-neon-yellow text-gaming-dark font-heading rounded-xl hover:bg-white transition-all flex items-center gap-2">{isSavingSettings ? <Loader2 key="gift-loader" className="w-5 h-5 animate-spin" /> : <Save key="gift-save" className="w-5 h-5" />} Simpan Hadiah Digital</button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'music' && (
            <motion.div key="music" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass p-8 rounded-2xl border-white/10">
              <form onSubmit={saveSettings} className="space-y-8">
                <div className="flex items-center justify-between"><h3 className="text-xl font-heading text-neon-pink flex items-center gap-2"><Music className="w-5 h-5" /> Background Music</h3></div>
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="glass p-8 rounded-3xl border-white/5 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-neon-pink/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Music className={`w-16 h-16 mx-auto mb-6 ${previewPlaying ? 'text-neon-pink animate-bounce' : 'text-white/20'}`} />
                    <h4 className="text-xl font-heading mb-2">{settings.musicTitle || 'No Music Selected'}</h4>
                    <p className="text-white/40 text-xs mb-8 truncate max-w-xs mx-auto">{settings.musicUrl}</p>
                    <div className="flex justify-center gap-4">
                      <button type="button" onClick={togglePreview} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${previewPlaying ? 'bg-neon-pink text-white scale-110 shadow-lg shadow-neon-pink/20' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                        {previewPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                      </button>
                    </div>
                    <audio ref={previewAudioRef} src={settings.musicUrl} onEnded={() => setPreviewPlaying(false)} />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-heading text-white/60 text-center uppercase tracking-widest">Upload New Quest Music</label>
                    <div className="relative">
                      <input type="file" accept="audio/*" onChange={handleMusicUpload} className="hidden" id="music-upload" disabled={isUploadingMusic} />
                      <label htmlFor="music-upload" className={`w-full py-10 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-neon-pink/50 hover:bg-neon-pink/5 transition-all ${isUploadingMusic ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {isUploadingMusic ? <Loader2 className="w-8 h-8 animate-spin text-neon-pink" /> : <Upload className="w-8 h-8 text-white/20 mb-2" />}
                        <span className="text-sm font-heading text-white/40">{isUploadingMusic ? 'Uploading Track...' : 'Click to Upload MP3'}</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold">Music URL (Direct Link)</label>
                    <input type="text" value={settings.musicUrl} onChange={(e) => setSettings({...settings, musicUrl: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-pink outline-none text-white text-xs" placeholder="https://example.com/music.mp3" />
                  </div>
                </div>
                <div className="flex justify-end pt-8 border-t border-white/10">
                  <button type="submit" disabled={isSavingSettings} className="px-10 py-3 bg-neon-pink text-white font-heading rounded-xl hover:bg-white hover:text-gaming-dark transition-all flex items-center gap-2">
                    {isSavingSettings ? <Loader2 key="music-loader" className="w-5 h-5 animate-spin" /> : <Save key="music-save" className="w-5 h-5" />} Simpan Konfigurasi Musik
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'seo' && (
            <motion.div key="seo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass p-8 rounded-2xl border-white/10">
              <form onSubmit={saveSettings} className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-heading text-neon-cyan flex items-center gap-2"><Globe className="w-5 h-5" /> SEO & Social Share</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold">Judul Undangan (OG Title)</label>
                      <input type="text" value={settings.ogTitle || ''} onChange={(e) => setSettings({...settings, ogTitle: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-cyan outline-none text-white text-sm" placeholder="Contoh: Undangan Tasyakuran Khitan Wahid" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase mb-1 font-bold">Deskripsi Singkat (OG Description)</label>
                      <textarea value={settings.ogDescription || ''} onChange={(e) => setSettings({...settings, ogDescription: e.target.value})} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:border-neon-cyan outline-none resize-none text-white text-sm" placeholder="Kami mengundang Anda untuk merayakan..." />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <ImageUpload 
                      label="Thumbnail Share (OG Image)" 
                      value={settings.ogImage || ''} 
                      onChange={(url) => setSettings({...settings, ogImage: url})} 
                    />
                    <p className="text-[10px] text-white/40 italic">*Gambar ini akan muncul saat link dibagikan ke WhatsApp/FB.</p>
                    
                    <div className="pt-4 border-t border-white/5">
                      <ImageUpload 
                        label="Favicon (Icon Tab Browser)" 
                        value={settings.faviconUrl || ''} 
                        onChange={(url) => setSettings({...settings, faviconUrl: url})} 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-8 border-t border-white/10">
                  <button type="submit" disabled={isSavingSettings} className="px-10 py-3 bg-neon-cyan text-gaming-dark font-heading rounded-xl hover:bg-white transition-all flex items-center gap-2">
                    {isSavingSettings ? <Loader2 key="seo-loader" className="w-5 h-5 animate-spin" /> : <Save key="seo-save" className="w-5 h-5" />} Simpan SEO & Share
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]"
            >
              <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-xl ${
                status.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 
                status.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 
                'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan'
              }`}>
                {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="font-heading text-sm">{status.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
