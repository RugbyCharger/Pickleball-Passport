interface DroneStripProps {
  src: string;
  poster: string;
  height?: string;
}

export function DroneStrip({ src, poster, height = 'h-64 sm:h-80' }: DroneStripProps) {
  return (
    <section className={`relative ${height} overflow-hidden`}>
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
        className="absolute inset-0 w-full h-full object-cover object-center"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/20" />
      <a
        href="https://www.instagram.com/micahphotography1"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-4 z-10 text-white/40 hover:text-white/70 transition-colors text-xs tracking-wide"
      >
        Aerial footage: @micahphotography1
      </a>
    </section>
  );
}
