'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function StarCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let raf = 0;
    let stars = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      stars = Array.from({ length: Math.min(190, Math.floor((width * height) / 6500)) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.3,
        a: Math.random() * 0.75 + 0.2,
        v: (Math.random() * 0.006 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        star.a += star.v;
        if (star.a > 1 || star.a < 0.15) star.v *= -1;
        ctx.save();
        ctx.globalAlpha = star.a;
        ctx.fillStyle = '#f3edff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#b6a0ff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} id="stars-canvas" aria-hidden="true" />;
}

function StarMap({ config }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !config) return;

    const ctx = canvas.getContext('2d');
    const size = 520;
    canvas.width = size;
    canvas.height = size;

    const seed = new Date(config.star_date || config.start_date || '2022-06-12').getTime();
    const rng = (salt) => {
      const x = Math.sin(seed + salt) * 10000;
      return x - Math.floor(x);
    };

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, '#21123a');
    gradient.addColorStop(0.62, '#100821');
    gradient.addColorStop(1, '#06040d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const stars = Array.from({ length: 72 }, (_, i) => ({
      x: 40 + rng(i * 1.7) * 440,
      y: 40 + rng(i * 2.9) * 440,
      r: rng(i * 4.1) * 2.2 + 0.6,
      a: rng(i * 7.3) * 0.55 + 0.35,
    }));

    ctx.strokeStyle = 'rgba(255, 255, 255, .16)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 11; i += 1) {
      const a = stars[i];
      const b = stars[(i + 2) % 12];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    for (const star of stars) {
      ctx.save();
      ctx.globalAlpha = star.a;
      ctx.fillStyle = '#fff7ff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#b894ff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.strokeStyle = 'rgba(255,255,255,.08)';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 210, 0, Math.PI * 2);
    ctx.stroke();
  }, [config]);

  return <canvas ref={canvasRef} id="star-canvas" />;
}

function WordGame({ game }) {
  const word = (game?.word || 'AMOR').toUpperCase().replace(/\s/g, '');
  const [guessed, setGuessed] = useState(new Set());
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const maxWrong = 6;
  const wrongLetters = [...guessed].filter((letter) => !word.includes(letter));

  const guess = useCallback((letter) => {
    if (guessed.has(letter) || won || lost) return;
    const next = new Set([...guessed, letter]);
    setGuessed(next);
    if ([...word].every((item) => next.has(item))) setWon(true);
    if ([...next].filter((item) => !word.includes(item)).length >= maxWrong) setLost(true);
  }, [guessed, lost, won, word]);

  useEffect(() => {
    const onKey = (event) => {
      const letter = event.key.toUpperCase();
      if (/^[A-Z]$/.test(letter)) guess(letter);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [guess]);

  const restart = () => {
    setGuessed(new Set());
    setWon(false);
    setLost(false);
  };

  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  return (
    <div className="word-game-wrap">
      {game?.hint && <p className="wg-hint">{game.hint}</p>}
      <div className="wg-word">
        {[...word].map((letter, index) => (
          <div key={`${letter}-${index}`} className={`wg-letter${guessed.has(letter) ? ' revealed' : ''}`}>
            {guessed.has(letter) ? letter : ''}
          </div>
        ))}
      </div>
      <div className="wg-status">
        {won && 'Voce acertou.'}
        {lost && `Era "${word}". Tenta de novo.`}
        {!won && !lost && `${maxWrong - wrongLetters.length} tentativas restantes`}
      </div>
      <div className="wg-keyboard">
        {rows.map((row) => (
          <div key={row.join('')} className="wg-keyboard-row">
            {row.map((letter) => (
              <button
                key={letter}
                className={`wg-key${guessed.has(letter) ? (word.includes(letter) ? ' hit' : ' miss') : ''}`}
                disabled={guessed.has(letter) || won || lost}
                onClick={() => guess(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
        ))}
      </div>
      {(won || lost) && <button className="wg-restart" onClick={restart}>Jogar novamente</button>}
    </div>
  );
}

function AppChrome() {
  return (
    <>
      <div className="story-bars" aria-hidden="true">
        <span /><span /><span /><span /><span /><span />
      </div>
      <div className="gift-topbar">
        <span className="gift-close">v</span>
        <span className="gift-pill">A nossa historia</span>
        <span className="gift-menu">...</span>
      </div>
      <nav className="gift-bottom-nav" aria-label="Navegacao do presente">
        <a href="#s-hero" className="gift-nav-item">
          <span className="gift-nav-icon">⌂</span>
          <span>Inicio</span>
        </a>
        <a href="#s-timeline" className="gift-nav-item">
          <span className="gift-nav-icon">♡</span>
          <span>Jornada</span>
        </a>
        <a href="#s-gallery" className="gift-nav-item">
          <span className="gift-nav-icon">▦</span>
          <span>Fotos</span>
        </a>
      </nav>
    </>
  );
}

function ScrollCue({ label }) {
  return (
    <div className="scroll-cue" aria-hidden="true">
      <span>{label}</span>
      <strong>⌃</strong>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [wordGame, setWordGame] = useState(null);
  const [mapLocs, setMapLocs] = useState([]);
  const [entered, setEntered] = useState(() => (
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === '1'
  ));
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const audioRef = useRef(null);
  const mapRef = useRef(null);
  const mapInitRef = useRef(false);
  const counterTimer = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/config').then((res) => res.json()),
      fetch('/api/timeline').then((res) => res.json()),
      fetch('/api/gallery').then((res) => res.json()),
      fetch('/api/word-game').then((res) => res.json()),
      fetch('/api/map').then((res) => res.json()),
    ]).then(([cfg, tl, gal, wg, mp]) => {
      setData(cfg);
      setTimeline(tl || []);
      setGallery(gal || []);
      setWordGame(wg || null);
      setMapLocs(mp || []);
      if (cfg?.name1 && cfg?.name2) document.title = `${cfg.name1} & ${cfg.name2}`;
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!entered) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.18 });
    document.querySelectorAll('.section').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [entered]);

  useEffect(() => {
    if (!entered || !data) return;
    const tick = () => {
      const now = new Date();
      const start = new Date(data.start_date || '2022-06-12T00:00:00');
      const ref = now > start ? start : now;
      const curr = now > start ? now : start;
      let years = curr.getFullYear() - ref.getFullYear();
      let months = curr.getMonth() - ref.getMonth();
      let days = curr.getDate() - ref.getDate();
      if (days < 0) {
        months -= 1;
        days += new Date(curr.getFullYear(), curr.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      const total = Math.floor(Math.abs(now - start) / 1000);
      const values = {
        cy: years,
        cm: months,
        cd: days,
        ch: Math.floor(total / 3600) % 24,
        cmin: Math.floor(total / 60) % 60,
        cs: total % 60,
      };
      Object.entries(values).forEach(([id, value]) => {
        const node = document.getElementById(id);
        if (node) node.textContent = String(value).padStart(2, '0');
      });
    };
    tick();
    counterTimer.current = setInterval(tick, 1000);
    return () => clearInterval(counterTimer.current);
  }, [data, entered]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !data?.music_url) return;
    audio.src = data.music_url;
    const onTime = () => {
      if (!audio.duration) return;
      const fill = document.getElementById('mpf');
      if (fill) fill.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
    };
    audio.addEventListener('timeupdate', onTime);
    return () => audio.removeEventListener('timeupdate', onTime);
  }, [data]);

  useEffect(() => {
    if (!entered || mapInitRef.current || mapLocs.length === 0) return;
    import('leaflet').then((L) => {
      if (mapInitRef.current) return;
      mapInitRef.current = true;
      const map = L.map('love-map', { zoomControl: false, scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      const bounds = [];
      const icon = L.divIcon({
        html: '<div class="map-pulse-pin"><div class="map-pin-inner">♥</div><div class="map-pin-ring"></div></div>',
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      mapLocs.forEach((loc) => {
        if (!loc.lat || !loc.lng) return;
        const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div class="map-popup-polaroid">
            ${loc.photo_url ? `<div class="map-pop-polaroid-card"><div class="map-pop-polaroid-img-wrap"><img src="${loc.photo_url}" alt="" /></div><p class="map-pop-polaroid-caption">${loc.photo_caption || loc.nickname || loc.name}</p></div>` : ''}
            <div class="map-pop-details">
              <h3 class="map-pop-title">${loc.nickname || loc.name || 'Nosso lugar'}</h3>
              ${loc.description ? `<p class="map-pop-desc">${loc.description}</p>` : ''}
            </div>
          </div>
        `, { maxWidth: 240, minWidth: 190, className: 'custom-leaflet-popup' });
        bounds.push([loc.lat, loc.lng]);
      });

      if (bounds.length === 1) map.setView(bounds[0], 13);
      if (bounds.length > 1) map.fitBounds(bounds, { padding: [42, 42] });
      mapRef.current = map;
    }).catch(console.error);
  }, [entered, mapLocs]);

  const coverSrc = useMemo(() => (
    gallery.find((item) => item.src)?.src ||
    timeline.find((item) => item.photo_url)?.photo_url ||
    mapLocs.find((item) => item.photo_url)?.photo_url ||
    ''
  ), [gallery, mapLocs, timeline]);

  const fmt = (value) => {
    if (!value) return '';
    try {
      return new Date(`${String(value).split('T')[0]}T12:00:00`).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return value;
    }
  };

  const fmtShort = (value) => {
    if (!value) return '';
    try {
      return new Date(`${String(value).split('T')[0]}T12:00:00`).toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return value;
    }
  };

  const enter = () => {
    setEntered(true);
    setTimeout(() => {
      audioRef.current?.play().then(() => setMusicPlaying(true)).catch(() => {});
    }, 400);
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
    } else {
      audio.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  };

  const flyToLoc = (loc) => {
    mapRef.current?.flyTo([loc.lat, loc.lng], 14, { duration: 1.2 });
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  };

  if (!data) {
    return (
      <div className="loading-screen">
        <span>Carregando</span>
      </div>
    );
  }

  const giverName = data.name2 || data.name1 || 'Alguem';

  return (
    <>
      <StarCanvas />

      {!entered && (
        <div className="entry-screen">
          <AppChrome />
          <div className="entry-content">
            {coverSrc && <img className="entry-cover" src={coverSrc} alt="" />}
            <span className="entry-kicker">Presente interativo</span>
            <h1 className="entry-title">{data.entry_title || `${giverName} preparou uma surpresa`}</h1>
            <p className="entry-subtitle">
              {data.entry_subtitle || 'Uma retrospectiva com musica, memoria, mapa e pequenos jogos so de voces.'}
            </p>
            <button className="enter-btn" onClick={enter}>Ver presente</button>
          </div>
        </div>
      )}

      {entered && (
        <main className="main-wrap">
          <AppChrome />

          <section className="section hero-section visible" id="s-hero">
            <div className="hero-art">
              {coverSrc ? <img src={coverSrc} alt="" /> : <div className="hero-art-fallback">♥</div>}
            </div>
            <div className="hero-songline">
              <h1>{data.name1} & {data.name2}</h1>
              <span className="hero-check">✓</span>
            </div>
            <p className="hero-artist">{data.hero_tagline || 'A nossa historia, do nosso jeito.'}</p>
            {data.music_url && (
              <div className="spotify-player">
                <div className="music-progress-track"><div id="mpf" className="music-progress-fill" /></div>
                <div className="music-time"><span>0:00</span><span>-2:13</span></div>
                <div className="player-controls">
                  <button type="button" className="control-btn">↝</button>
                  <button type="button" className="control-btn muted">|‹</button>
                  <button type="button" className="control-btn play-main" onClick={toggleMusic}>
                    {musicPlaying ? 'II' : '▶'}
                  </button>
                  <button type="button" className="control-btn muted">›|</button>
                  <button type="button" className="control-btn">↜</button>
                </div>
                <div className="music-meta">
                  <strong>{data.music_song || 'Nossa musica'}</strong>
                  <span>{data.music_artist || 'A trilha de voces'}</span>
                </div>
              </div>
            )}
            <ScrollCue label="Linha do tempo" />
          </section>

          <section className="section counter-section" id="s-counter">
            <div className="story-label">Desde {fmt(data.start_date)}</div>
            <h2 className="section-title">{data.counter_label || 'Juntos ha'}</h2>
            <div className="counter-wrap">
              {[
                ['cy', 'anos'],
                ['cm', 'meses'],
                ['cd', 'dias'],
                ['ch', 'horas'],
                ['cmin', 'min'],
                ['cs', 'seg'],
              ].map(([id, label]) => (
                <div key={id} className="counter-card">
                  <span id={id} className="cc-val">00</span>
                  <span className="cc-label">{label}</span>
                </div>
              ))}
            </div>
            <ScrollCue label="Nossa jornada" />
          </section>

          {timeline.length > 0 && (
            <section className="section timeline-section" id="s-timeline">
              <div className="journey-heading">
                <p>Linha do tempo</p>
                <h2>Nossa Jornada</h2>
              </div>
              <div className="timeline-container">
                {timeline.map((item, index) => (
                  <article key={item.id || `${item.title}-${index}`} className={`timeline-entry entry-${index % 2 === 0 ? 'media-left' : 'media-right'}`}>
                    <div className="tl-media">
                      {item.photo_url && (
                        <div className="tl-polaroid">
                          <img src={item.photo_url} alt={item.photo_caption || item.title} loading="lazy" />
                          <p className="tl-polaroid-caption">{item.photo_caption || item.title}</p>
                        </div>
                      )}
                    </div>
                    <div className="tl-dot" aria-hidden="true">♥</div>
                    <div className="tl-copy">
                      <div className="tl-date">{fmtShort(item.date_event)}</div>
                      <div className="tl-title">{item.title}</div>
                      {item.description && <div className="tl-desc">{item.description}</div>}
                    </div>
                  </article>
                ))}
              </div>
              <ScrollCue label="Mapa das estrelas" />
            </section>
          )}

          {data.star_date && (
            <section className="section star-map-section" id="s-stars">
              <div className="story-label">O ceu do nosso dia</div>
              <h2 className="section-title">{data.star_title || 'Mapa das Estrelas'}</h2>
              <div className="star-map-wrap">
                <div className="star-map-canvas-wrap"><StarMap config={data} /></div>
                <p className="star-map-coords">{fmt(data.star_date)} · {Number(data.star_lat || 0).toFixed(2)}, {Number(data.star_lng || 0).toFixed(2)}</p>
              </div>
              <ScrollCue label="Galeria" />
            </section>
          )}

          {gallery.length > 0 && (
            <section className="section gallery-section" id="s-gallery">
              <div className="story-label">Galeria</div>
              <h2 className="section-title">Nossos registros</h2>
              <div className="gallery-grid">
                {gallery.map((photo, index) => (
                  <button key={photo.id || `${photo.src}-${index}`} className="gallery-item" onClick={() => openLightbox(index)}>
                    {photo.src ? <img src={photo.src} alt={photo.caption || ''} loading="lazy" /> : <span>Foto</span>}
                    {photo.caption && <span className="gallery-caption">{photo.caption}</span>}
                  </button>
                ))}
              </div>
              <ScrollCue label="Jogo" />
            </section>
          )}

          {wordGame?.word && (
            <section className="section game-section" id="s-game">
              <div className="story-label">Jogo de palavras</div>
              <h2 className="section-title">{wordGame.title || 'O que mais gosto em voce'}</h2>
              <WordGame game={wordGame} />
              <ScrollCue label="Mapa" />
            </section>
          )}

          {mapLocs.length > 0 && (
            <section className="section map-section" id="s-map">
              <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
              <div className="story-label">Lugares que marcaram</div>
              <h2 className="section-title">Nossa jornada no mapa</h2>
              <div className="map-wrap">
                <div id="love-map" />
                <div className="map-locations-list">
                  {mapLocs.map((loc, index) => (
                    <button key={loc.id || `${loc.name}-${index}`} className="map-location-item" onClick={() => flyToLoc(loc)}>
                      <span className="map-loc-pin">♥</span>
                      <span className="map-loc-info">
                        <strong className="map-loc-name">{loc.nickname || loc.name}</strong>
                        {loc.description && <span className="map-loc-desc">{loc.description}</span>}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <ScrollCue label="Mensagem" />
            </section>
          )}

          {data.special_message && (
            <section className="section message-section" id="s-message">
              <div className="story-label">Final</div>
              <h2 className="section-title">Uma mensagem para voce</h2>
              {!msgOpen ? (
                <button className="message-envelope" onClick={() => setMsgOpen(true)}>
                  <span className="seal-icon">♥</span>
                  <strong>Toque para abrir</strong>
                </button>
              ) : (
                <div className="message-card">
                  <p className="message-text">{data.special_message}</p>
                  {data.message_signature && <p className="message-sig">{data.message_signature}</p>}
                </div>
              )}
            </section>
          )}
        </main>
      )}

      {lightboxIndex !== null && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lb-close" onClick={closeLightbox}>x</button>
          <div className="lb-inner" onClick={(event) => event.stopPropagation()}>
            <img src={gallery[lightboxIndex]?.src} alt={gallery[lightboxIndex]?.caption || ''} />
            {gallery[lightboxIndex]?.caption && <p className="lb-caption">{gallery[lightboxIndex].caption}</p>}
          </div>
        </div>
      )}

      <audio ref={audioRef} loop preload="auto" />
    </>
  );
}
