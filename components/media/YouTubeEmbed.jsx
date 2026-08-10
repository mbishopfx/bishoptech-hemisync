const YOUTUBE_ALLOW = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

export function YouTubeEmbed({ src, title = 'YouTube video player', className = '' }) {
  return (
    <div className={`overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/80 shadow-[0_20px_80px_rgba(6,182,212,0.08)] ${className}`}>
      <div className="aspect-video">
        <iframe
          width="560"
          height="315"
          src={src}
          title={title}
          frameBorder="0"
          allow={YOUTUBE_ALLOW}
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          loading="lazy"
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
