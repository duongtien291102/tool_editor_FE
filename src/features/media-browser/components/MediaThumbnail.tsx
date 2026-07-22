import React, { useEffect, useState } from 'react';
import { MediaApi } from '@/api/MediaApi';

export const MediaThumbnail: React.FC<{ id: string; available: boolean; name: string }> = ({
  id,
  available,
  name,
}) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    if (available) {
      void MediaApi.content(id, 'thumbnail')
        .then((blob) => {
          if (!active || !blob.type.startsWith('image/')) return;
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        })
        .catch(() => undefined);
    }
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [available, id]);

  if (url) return <img className="h-full w-full object-cover" src={url} alt={name} />;
  return (
    <div
      className="h-full w-full flex items-center justify-center bg-muted text-2xl text-muted-foreground"
      aria-label="Thumbnail unavailable"
    >
      ◇
    </div>
  );
};
