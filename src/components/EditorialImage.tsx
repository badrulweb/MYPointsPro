import { BookOpen } from 'lucide-react';
import { useState } from 'react';

interface EditorialImageProps {
  src: string;
  alt: string;
  caption?: string;
  aspectClass?: string;
  className?: string;
}

export function EditorialImage({
  src,
  alt,
  caption,
  aspectClass = 'aspect-[4/3]',
  className = '',
}: EditorialImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className={`w-full ${className}`}>
      <div
        className={`relative w-full overflow-hidden rounded-xl bg-[#E9EDF2] border border-[#E4E7EC] ${aspectClass}`}
      >
        {!failed && src ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
            className="w-full h-full object-cover transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#F1F5F9] via-[#E2E8F0] to-[#CBD5E1]">
            <BookOpen className="w-7 h-7 text-[#0B192C] mb-2" strokeWidth={1.5} />
            <span className="font-serif text-sm text-[#0B192C] max-w-xs">{alt}</span>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-xs font-serif italic text-[#475569] leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
