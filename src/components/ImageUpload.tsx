import React, { useState, useRef } from 'react';
import { Link as LinkIcon, ExternalLink, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Hanya file gambar yang diperbolehkan.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 5MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Gagal mengunggah gambar.');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Terjadi kesalahan saat mengunggah.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] text-white/40 uppercase">{label}</label>
        <div className="flex gap-3">
          <span className="text-[10px] text-white/20 italic">Server Alibaba Aktif</span>
          <a 
            href="https://postimages.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-neon-cyan hover:underline flex items-center gap-1"
          >
            Upload Gratis <ExternalLink className="w-2 h-2" />
          </a>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
            <LinkIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 focus:border-neon-cyan outline-none text-sm"
            placeholder="https://justbluenyellow.my.id/galeri/..."
          />
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`px-4 rounded-xl border border-white/10 flex items-center justify-center transition-all ${
            isUploading ? 'bg-white/5 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 hover:border-neon-cyan'
          }`}
          title="Upload dari Laptop"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 text-neon-cyan animate-spin" />
          ) : (
            <Upload className="w-4 h-4 text-white/60" />
          )}
        </button>
      </div>

      {uploadError && (
        <p className="text-[10px] text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {uploadError}
        </p>
      )}
      
      {value && !uploadError && (
        <div className="mt-2 relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 bg-white/5">
          <img 
            src={value} 
            alt="Preview" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=Link+Gambar+Tidak+Valid';
            }}
          />
          <div className="absolute top-2 right-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 drop-shadow-lg" />
          </div>
        </div>
      )}
      <p className="text-[9px] text-white/30 italic">
        *Klik ikon upload untuk pilih file dari laptop. Link akan otomatis terisi.
      </p>
    </div>
  );
};
