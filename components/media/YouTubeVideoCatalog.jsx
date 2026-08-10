import { YouTubeEmbed } from '@/components/media/YouTubeEmbed';

const VIDEO_SOURCES = [
  'https://www.youtube.com/embed/q93VzJ_SxOY?si=TTcPXLOQcYEU5cH8',
  'https://www.youtube.com/embed/KLzF6mda2E0?si=T5kkRVmwTdPPysaY',
  'https://www.youtube.com/embed/MXH2ojPXgwY?si=yGciFAPZVejJacAe'
];

export function YouTubeVideoCatalog() {
  return (
    <section id="video-catalog" aria-label="Cognistration video catalog" className="mb-32 grid gap-6 md:grid-cols-2">
      {VIDEO_SOURCES.map((src, index) => (
        <YouTubeEmbed key={src} src={src} title={`Cognistration video ${index + 1}`} className="liquid-glass p-2" />
      ))}
    </section>
  );
}
