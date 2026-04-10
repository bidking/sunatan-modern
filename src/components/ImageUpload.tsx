import React from 'react';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, label }) => {
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

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
          <LinkIcon className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 focus:border-neon-cyan outline-none text-sm"
          placeholder="https://justbluenyellow.my.id/galeri/nama_foto.jpg"
        />
      </div>
      
      {value && (
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
        </div>
      )}
      <p className="text-[9px] text-white/30 italic">
        *Contoh link server Anda: https://justbluenyellow.my.id/galeri/foto.jpg
      </p>
    </div>
  );
};
