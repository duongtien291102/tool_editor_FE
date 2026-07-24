import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

export interface AssetRecord {
  id: string;
  name: string;
  type: 'Video' | 'Audio' | 'Image';
  fileSize: string;
  duration?: string;
  url: string;
  uploadedAt: string;
}

export const AssetLibrary: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [assets] = useState<AssetRecord[]>([
    {
      id: 'a-1',
      name: 'cyberpunk_city_bg.mp4',
      type: 'Video',
      fileSize: '24.5 MB',
      duration: '00:15',
      url: '#',
      uploadedAt: '2026-07-24',
    },
    {
      id: 'a-2',
      name: 'synthwave_soundtrack.mp3',
      type: 'Audio',
      fileSize: '4.2 MB',
      duration: '02:30',
      url: '#',
      uploadedAt: '2026-07-23',
    },
    {
      id: 'a-3',
      name: 'character_concept_ref.png',
      type: 'Image',
      fileSize: '1.8 MB',
      url: '#',
      uploadedAt: '2026-07-22',
    },
  ]);

  const filtered = assets.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || a.type.toUpperCase() === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between border-b border-border pb-3">
        <div>
          <h2 className="text-base font-semibold">Asset Library</h2>
          <p className="text-xs text-muted-foreground">Browse, preview, and upload media assets</p>
        </div>
        <Button size="sm" onClick={() => setIsUploadModalOpen(true)}>
          + Upload Asset
        </Button>
      </div>

      {/* Search & Type filter */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Filter assets..."
          className="h-8 flex-1 rounded-md border border-input bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {['ALL', 'VIDEO', 'AUDIO', 'IMAGE'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded border transition-colors ${
              filterType === t
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border text-muted-foreground hover:bg-accent'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((asset) => (
          <div
            key={asset.id}
            className="p-3 rounded-md border border-border bg-background space-y-2 hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  asset.type === 'Video'
                    ? 'bg-blue-500/10 text-blue-500'
                    : asset.type === 'Audio'
                      ? 'bg-purple-500/10 text-purple-500'
                      : 'bg-emerald-500/10 text-emerald-500'
                }`}
              >
                {asset.type}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">{asset.fileSize}</span>
            </div>
            <p className="text-xs font-medium text-foreground truncate">{asset.name}</p>
            {asset.duration && (
              <p className="text-[10px] text-muted-foreground">Duration: {asset.duration}</p>
            )}
          </div>
        ))}
      </div>

      {/* Upload Modal Mock */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-5 space-y-4">
            <h3 className="text-base font-semibold">Upload Media Asset</h3>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Drag and drop MP4, MP3, PNG, JPG files here
              </p>
              <Button size="sm">Choose File</Button>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
