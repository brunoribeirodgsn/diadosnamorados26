'use client';
// app/page.js — Site Público
import { useEffect, useRef, useState, useCallback } from 'react';

// ── Componentes inline ────────────────────────────────────────────
function StarCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, stars = [], meteors = [], raf;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      buildStars();
    }
    function buildStars() {
      const n = Math.min(Math.floor((W * H) / 5000), 300);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.6 + 0.2, alpha: Math.random(),
        da: (Math.random() * 0.006 + 0.002) * (Math.random() > .5 ? 1 : -1),
        hue: 200 + Math.random() * 60,
      }));
    }
    const addMeteor = () => {
      if (document.hidden) return;
      meteors.push({ x: -50, y: Math.random() * H * 0.6, vx: 6 + Math.random() * 5, vy: 2 + Math.random() * 3, len: 120 + Math.random() * 80, life: 0, maxLife: 55 });
    };
    const iv = setInterval(addMeteor, 5000);

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.alpha += s.da;
        if (s.alpha > 1)   { s.alpha = 1;   s.da *= -1; }
        if (s.alpha < 0.1) { s.alpha = 0.1; s.da *= -1; }
        ctx.save(); ctx.globalAlpha = s.alpha;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${s.hue},80%,88%)`;
        ctx.shadowBlur = 4; ctx.shadowColor = `hsl(${s.hue},100%,80%)`;
        ctx.fill(); ctx.restore();
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx; m.y += m.vy; m.life++;
        const a = 1 - m.life / m.maxLife;
        if (a <= 0) { meteors.splice(i, 1); continue; }
        const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * m.len / 6, m.y - m.vy * m.len / 6);
        g.addColorStop(0, `rgba(200,180,255,${a})`); g.addColorStop(1, 'rgba(200,180,255,0)');
        ctx.save(); ctx.strokeStyle = g; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * m.len / 6, m.y - m.vy * m.len / 6);
        ctx.stroke(); ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); clearInterval(iv); };
  }, []);
  return <canvas ref={canvasRef} id="stars-canvas" />;
}

function StarMap({ config }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !config) return;
    const ctx = canvas.getContext('2d');
    const S = 500; canvas.width = canvas.height = S;
    ctx.fillStyle = '#03030f'; ctx.fillRect(0, 0, S, S);

    // Seed baseado na data para gerar constelação consistente
    const seed = new Date(config.star_date || '2022-06-12').getTime();
    const rng = (s) => { let x = Math.sin(s) * 10000; return x - Math.floor(x); };

    // Gerar estrelas da constelação
    const stars = Array.from({ length: 80 }, (_, i) => ({
      x: 30 + rng(seed + i * 1.1) * 440,
      y: 30 + rng(seed + i * 2.3) * 440,
      r: rng(seed + i * 3.7) * 2 + 0.5,
      alpha: rng(seed + i * 5.1) * 0.5 + 0.5,
    }));

    // Estrelas de fundo
    for (let i = 0; i < 200; i++) {
      const x = rng(seed + i * 0.13) * S, y = rng(seed + i * 0.27) * S;
      const r = rng(seed + i * 0.41) * 1.2 + 0.2;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,160,255,${rng(seed + i * 0.7) * 0.5 + 0.2})`; ctx.fill();
    }

    // Linhas da constelação (conectar as 10 estrelas principais)
    const mainStars = stars.slice(0, 10);
    ctx.strokeStyle = 'rgba(167,139,250,0.25)'; ctx.lineWidth = 1;
    for (let i = 0; i < mainStars.length - 1; i++) {
      if (rng(seed + i * 99) > 0.4) {
        const a = mainStars[i], b = mainStars[(i + 2) % mainStars.length];
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }

    // Desenhar estrelas
    for (const s of stars) {
      ctx.save(); ctx.globalAlpha = s.alpha;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = '#e8d5ff'; ctx.shadowBlur = 6; ctx.shadowColor = '#a78bfa'; ctx.fill();
      ctx.restore();
    }
  }, [config]);
  return <canvas ref={canvasRef} id="star-canvas" style={{ width: '100%', height: '100%' }} />;
}

function WordGame({ game }) {
  const word   = (game?.word || 'AMOR').toUpperCase().replace(/\s/g, '');
  const [guessed, setGuessed] = useState(new Set());
  const [won, setWon]         = useState(false);
  const [lost, setLost]       = useState(false);

  const wrongLetters = [...guessed].filter(l => !word.includes(l));
  const maxWrong = 6;

  const guess = useCallback((letter) => {
    if (guessed.has(letter) || won || lost) return;
    const next = new Set([...guessed, letter]);
    setGuessed(next);
    const allRevealed = [...word].every(l => next.has(l));
    if (allRevealed) setWon(true);
    else if ([...next].filter(l => !word.includes(l)).length >= maxWrong) setLost(true);
  }, [guessed, won, lost, word]);

  const restart = () => { setGuessed(new Set()); setWon(false); setLost(false); };

  useEffect(() => {
    const onKey = (e) => {
      const l = e.key.toUpperCase();
      if (/^[A-ZÁÉÍÓÚÀÃÕÂÊÎÔÛÇ]$/.test(l)) guess(l);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [guess]);

  const rows = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M'],
  ];

  return (
    <div className="word-game-wrap">
      {game?.hint && <p className="wg-hint">💡 {game.hint}</p>}
      <div className="wg-word">
        {[...word].map((l, i) => (
          <div key={i} className={`wg-letter${guessed.has(l) ? ' revealed' : ''}`}>
            {guessed.has(l) ? l : ''}
          </div>
        ))}
      </div>
      {wrongLetters.length > 0 && (
        <div className="wg-wrong-letters">
          {wrongLetters.map(l => <span key={l} className="wg-wrong">{l}</span>)}
        </div>
      )}
      <div className="wg-status">
        {won  ? '🎉 Parabéns! Você acertou!' : ''}
        {lost ? `💔 Era "${word}" — tente novamente!` : ''}
        {!won && !lost ? `${maxWrong - wrongLetters.length} tentativas restantes` : ''}
      </div>
      <div className="wg-keyboard">
        {rows.map((row, ri) => (
          <div key={ri} className="wg-keyboard-row">
            {row.map(l => (
              <button key={l} className={`wg-key${guessed.has(l) ? (word.includes(l) ? ' hit' : ' miss') : ''}`}
                onClick={() => guess(l)} disabled={guessed.has(l) || won || lost}>
                {l}
              </button>
            ))}
          </div>
        ))}
      </div>
      {(won || lost) && <button className="wg-restart" onClick={restart}>🔄 Jogar novamente</button>}
    </div>
  );
}

function AppChrome() {
  return (
    <>
      <div className="gift-topbar" aria-hidden="true">
        <span className="gift-close">×</span>
        <span className="gift-pill">Wrapped</span>
      </div>
      <nav className="gift-bottom-nav" aria-label="Navegação do presente">
        <a href="#s-hero" className="gift-nav-item">
          <span className="gift-nav-icon">⌂</span>
          <span>Início</span>
        </a>
        <a href="#s-timeline" className="gift-nav-item">
          <span className="gift-nav-icon">⌕</span>
          <span>Jornada</span>
        </a>
        <a href="#s-gallery" className="gift-nav-item">
          <span className="gift-nav-icon">▥</span>
          <span>Fotos</span>
        </a>
      </nav>
    </>
  );
}

// ── Página principal ──────────────────────────────────────────────
export default function Home() {
  const [data, setData]             = useState(null);
  const [timeline, setTimeline]     = useState([]);
  const [gallery, setGallery]       = useState([]);
  const [wordGame, setWordGame]     = useState(null);
  const [mapLocs, setMapLocs]       = useState([]);
  const [entered, setEntered]       = useState(false);
  const [musicPlaying, setPlaying]  = useState(false);
  const [msgOpen, setMsgOpen]       = useState(false);
  const [lbIdx, setLbIdx]           = useState(null);
  const audioRef = useRef(null);
  const mapRef   = useRef(null);
  const mapInitRef = useRef(false);

  // Buscar dados
  useEffect(() => {
    Promise.all([
      fetch('/api/config').then(r => r.json()),
      fetch('/api/timeline').then(r => r.json()),
      fetch('/api/gallery').then(r => r.json()),
      fetch('/api/word-game').then(r => r.json()),
      fetch('/api/map').then(r => r.json()),
    ]).then(([cfg, tl, gal, wg, mp]) => {
      setData(cfg); setTimeline(tl); setGallery(gal); setWordGame(wg); setMapLocs(mp);
      if (cfg?.name1 && cfg?.name2) {
        document.title = `${cfg.name1} & ${cfg.name2} 💖`;
      }
    }).catch(console.error);
  }, []);

  // Observar seções
  useEffect(() => {
    if (!entered) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.section').forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, [entered]);

  // Contador
  const counterRef = useRef(null);
  useEffect(() => {
    if (!entered || !data) return;
    const tick = () => {
      const now   = new Date(), start = new Date(data.start_date || '2022-06-12T00:00:00');
      const diff  = Math.abs(now - start);
      const totalSec = Math.floor(diff / 1000);
      const secs = totalSec % 60, totalMin = Math.floor(totalSec / 60);
      const mins = totalMin % 60, totalHrs = Math.floor(totalMin / 60);
      const hrs  = totalHrs % 24;
      const ref = now > start ? start : now, curr = now > start ? now : start;
      let years = curr.getFullYear() - ref.getFullYear();
      let months = curr.getMonth() - ref.getMonth();
      let days   = curr.getDate()  - ref.getDate();
      if (days < 0)   { months--; days  += new Date(curr.getFullYear(), curr.getMonth(), 0).getDate(); }
      if (months < 0) { years--;  months += 12; }
      const set = (id, v) => {
        const el = document.getElementById(id); if (!el) return;
        const s = String(v).padStart(2, '0');
        if (el.textContent !== s) { el.textContent = s; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
      };
      set('cy', years); set('cm', months); set('cd', days);
      set('ch', hrs);   set('cmin', mins); set('cs', secs);
    };
    tick();
    counterRef.current = setInterval(tick, 1000);
    return () => clearInterval(counterRef.current);
  }, [entered, data]);

  // Música
  const toggleMusic = () => {
    const audio = audioRef.current; if (!audio) return;
    if (musicPlaying) { audio.pause(); setPlaying(false); }
    else { audio.play().then(() => setPlaying(true)).catch(() => {}); }
  };
  useEffect(() => {
    const audio = audioRef.current; if (!audio || !data?.music_url) return;
    audio.src = data.music_url;
    const onTime = () => {
      if (!audio.duration) return;
      const bar = document.getElementById('mpf');
      if (bar) bar.style.width = (audio.currentTime / audio.duration * 100) + '%';
    };
    audio.addEventListener('timeupdate', onTime);
    return () => audio.removeEventListener('timeupdate', onTime);
  }, [data]);

  // Auto-play ao entrar
  const enter = () => {
    setEntered(true);
    setTimeout(() => {
      audioRef.current?.play().then(() => setPlaying(true)).catch(() => {});
    }, 600);
  };

  // Mapa Leaflet
  useEffect(() => {
    if (!entered || mapInitRef.current || mapLocs.length === 0) return;
    if (typeof window === 'undefined') return;
    import('leaflet').then(L => {
      if (mapInitRef.current) return;
      mapInitRef.current = true;
      const m = L.map('love-map', { zoomControl: true, scrollWheelZoom: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap', maxZoom: 18,
      }).addTo(m);
      const bounds = [];
      const icon = L.divIcon({
        html: '<div class="map-pulse-pin"><div class="map-pin-inner">💚</div><div class="map-pin-ring"></div></div>',
        className: '', iconSize: [32, 32], iconAnchor: [16, 32],
      });
      mapLocs.forEach(loc => {
        const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(m);
        const popupContent = `
          <div class="map-popup-polaroid">
            ${loc.photo_url ? `
              <div class="map-pop-polaroid-card">
                <div class="map-pop-polaroid-img-wrap">
                  <img src="${loc.photo_url}" alt="${loc.photo_caption || ''}" />
                </div>
                ${loc.photo_caption ? `<p class="map-pop-polaroid-caption">${loc.photo_caption}</p>` : ''}
                ${loc.date_visit ? `<p class="map-pop-polaroid-date">${fmt(loc.date_visit)}</p>` : ''}
              </div>
            ` : ''}
            <div class="map-pop-details">
              <h3 class="map-pop-title">${loc.nickname || 'Nossa Parada'}</h3>
              ${loc.nickname ? `<p class="map-pop-address">📍 ${loc.name.split(',')[0]}</p>` : ''}
              ${loc.description ? `<p class="map-pop-desc">${loc.description}</p>` : ''}
              ${!loc.photo_url && loc.date_visit ? `<p class="map-pop-date-only">${fmt(loc.date_visit)}</p>` : ''}
            </div>
          </div>
        `;
        marker.bindPopup(popupContent, { maxWidth: 240, minWidth: 200, className: 'custom-leaflet-popup' });
        bounds.push([loc.lat, loc.lng]);
      });
      if (bounds.length > 0) {
        if (bounds.length === 1) m.setView(bounds[0], 13);
        else m.fitBounds(bounds, { padding: [40, 40] });
      }
      mapRef.current = m;
    }).catch(console.error);
  }, [entered, mapLocs]);

  const flyToLoc = (loc) => {
    if (mapRef.current) mapRef.current.flyTo([loc.lat, loc.lng], 14, { duration: 1.5 });
  };

  // Lightbox
  const openLb = (i) => { setLbIdx(i); document.body.style.overflow = 'hidden'; };
  const closeLb = () => { setLbIdx(null); document.body.style.overflow = ''; };
  const prevLb  = (e) => { e.stopPropagation(); setLbIdx(i => (i - 1 + gallery.length) % gallery.length); };
  const nextLb  = (e) => { e.stopPropagation(); setLbIdx(i => (i + 1) % gallery.length); };
  useEffect(() => {
    const onKey = (e) => {
      if (lbIdx === null) return;
      if (e.key === 'Escape')      closeLb();
      if (e.key === 'ArrowLeft')   setLbIdx(i => (i - 1 + gallery.length) % gallery.length);
      if (e.key === 'ArrowRight')  setLbIdx(i => (i + 1) % gallery.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lbIdx, gallery]);

  const fmt = (str) => {
    if (!str) return '';
    try { return new Date(str + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch { return str; }
  };

  const fmtShort = (str) => {
    if (!str) return '';
    try { return new Date(str + 'T12:00:00').toLocaleDateString('pt-BR'); }
    catch { return str; }
  };

  const giverName = data?.name2 || data?.name1 || 'Alguém';

  if (!data) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap: 16, background:'#03030f', color:'#a78bfa' }}>
      <div style={{ fontSize:'3rem', animation:'spin 1s linear infinite' }}>💫</div>
      <p>Carregando...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <StarCanvas />

      {/* Entrada */}
      {!entered && (
        <div className="entry-screen">
          <AppChrome />
          <div className="entry-content">
            <h1 className="entry-title">
              {giverName} preparou um <span>presente</span> especial!
            </h1>
            <p className="entry-subtitle">Um momento único feito com carinho para celebrar a jornada de vocês</p>
            <button className="enter-btn" onClick={enter}>
              <span>Ver Presente</span>
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      {entered && (
        <div className="main-wrap">
          <AppChrome />

          {/* Player */}
          {data.music_url && (
            <div className="music-player">
              <div className={`music-vinyl${musicPlaying ? ' spinning' : ''}`}>🎵</div>
              <div className="music-info">
                <span className="music-song">{data.music_song || 'Nossa Música'}</span>
                <span className="music-artist">{data.music_artist || 'Artista'}</span>
              </div>
              <button className="music-play-btn" onClick={toggleMusic} aria-label="Play/Pause">
                {musicPlaying ? '⏸' : '▶'}
              </button>
              <div className="music-progress-track"><div id="mpf" className="music-progress-fill" /></div>
            </div>
          )}

          {/* Hero */}
          <section className="section hero-section visible" id="s-hero">
            <div className="hero-glow-1" /><div className="hero-glow-2" />
            <div className="hero-names">
              <span className="hero-name hero-name-1">{data.name1}</span>
              <span className="hero-heart">💖</span>
              <span className="hero-name hero-name-2">{data.name2}</span>
            </div>
            <p className="hero-tagline">{data.hero_tagline}</p>
            <div className="hero-date-chip">📅 Desde {fmt(data.start_date?.split('T')[0])}</div>
          </section>

          {/* Contador */}
          <section className="section counter-section" id="s-counter">
            <h2 className="section-title"><span className="stitle-icon">⏳</span>{data.counter_label || 'Juntos há'}</h2>
            <div className="counter-wrap">
              <div className="counter-row">
                {[['cy','Anos'],['cm','Meses'],['cd','Dias']].map(([id,lbl]) => (
                  <><div key={id} className="counter-card"><span id={id} className="cc-val">00</span><span className="cc-label">{lbl}</span></div>
                  {id !== 'cd' && <span className="counter-sep">:</span>}</>
                ))}
              </div>
              <div className="counter-row">
                {[['ch','Horas'],['cmin','Minutos'],['cs','Segundos']].map(([id,lbl],i) => (
                  <><div key={id} className={`counter-card counter-card-sm${id==='cs'?' counter-card-pulse':''}`}><span id={id} className="cc-val">00</span><span className="cc-label">{lbl}</span></div>
                  {i < 2 && <span className="counter-sep counter-sep-sm">:</span>}</>
                ))}
              </div>
            </div>
          </section>

          {/* Linha do Tempo */}
          {timeline.length > 0 && (
            <section className="section timeline-section" id="s-timeline">
              <div className="journey-heading">
                <h2>Nossa Jornada</h2>
                <p>Cada momento que nos trouxe até aqui.</p>
              </div>
              <div className="timeline-container">
                {timeline.map((item, idx) => (
                  <div key={item.id} className={`timeline-entry entry-${idx % 2 === 0 ? 'media-left' : 'media-right'}`}>
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
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Mapa das Estrelas */}
          {data.star_date && (
            <section className="section star-map-section" id="s-stars">
              <h2 className="section-title"><span className="stitle-icon">⭐</span>Mapa das Estrelas</h2>
              <div className="star-map-wrap">
                <div className="star-map-canvas-wrap"><StarMap config={data} /></div>
                <div className="star-map-info">
                  <div className="star-map-title">{data.star_title || 'O céu no nosso dia especial'}</div>
                  <div className="star-map-coords">{fmt(data.star_date)} · {data.star_lat?.toFixed(2)}°, {data.star_lng?.toFixed(2)}°</div>
                </div>
              </div>
            </section>
          )}

          {/* Galeria */}
          {gallery.length > 0 && (
            <section className="section gallery-section" id="s-gallery">
              <h2 className="section-title"><span className="stitle-icon">📸</span>Nossa Galeria</h2>
              <div className="gallery-grid">
                {gallery.map((photo, i) => (
                  <div key={photo.id} className="gallery-item" onClick={() => openLb(i)}>
                    {photo.src ? <img src={photo.src} alt={photo.caption} loading="lazy" /> : <div className="gallery-placeholder">📷</div>}
                    <div className="gallery-overlay"><span className="gallery-caption">{photo.caption}</span></div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Jogo de Palavras */}
          {wordGame?.word && (
            <section className="section" id="s-game">
              <h2 className="section-title"><span className="stitle-icon">🎮</span>{wordGame.title || 'Jogo de Palavras'}</h2>
              <WordGame game={wordGame} />
            </section>
          )}

          {/* Mapa de Locais */}
          {mapLocs.length > 0 && (
            <section className="section map-section" id="s-map">
              <h2 className="section-title"><span className="stitle-icon">🗺️</span>Nossa Jornada no Mapa</h2>
              <div className="map-wrap">
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                <div id="love-map" />
                <div className="map-locations-list">
                  {mapLocs.map(loc => (
                    <div key={loc.id} className="map-location-item" onClick={() => flyToLoc(loc)}>
                      <span className="map-loc-pin">📍</span>
                      <div className="map-loc-info">
                        <div className="map-loc-name">{loc.nickname || loc.name}</div>
                        {loc.nickname && <div className="map-loc-address">📍 {loc.name}</div>}
                        {loc.description && <div className="map-loc-desc">{loc.description}</div>}
                        {loc.date_visit && <div className="map-loc-date">{fmt(loc.date_visit)}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Mensagem */}
          {data.special_message && (
            <section className="section message-section" id="s-message">
              <h2 className="section-title"><span className="stitle-icon">💌</span>Mensagem Especial</h2>
              <div className="message-outer">
                {!msgOpen ? (
                  <div className="message-envelope" onClick={() => setMsgOpen(true)}>
                    <div className="envelope-flap" />
                    <div className="envelope-body">
                      <div className="envelope-seal">
                        <span className="seal-icon">💌</span>
                        <span className="seal-text">Toque para abrir</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="message-card">
                    <div className="message-lines" />
                    <p className="message-text">{data.special_message}</p>
                    {data.message_signature && <p className="message-sig">{data.message_signature}</p>}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Rodapé */}
          <footer className="site-footer">
            <div className="footer-constellation">✦ ✧ ✦ ✧ ✦</div>
            <p className="footer-names">{data.name1} & {data.name2}</p>
            <p className="footer-made">feito com todo o amor do mundo 💖</p>
          </footer>
        </div>
      )}

      {/* Lightbox */}
      {lbIdx !== null && (
        <div className="lightbox" onClick={closeLb}>
          <button className="lb-close" onClick={closeLb}>✕</button>
          <button className="lb-prev" onClick={prevLb}>‹</button>
          <div className="lb-inner" onClick={e => e.stopPropagation()}>
            <img src={gallery[lbIdx]?.src} alt={gallery[lbIdx]?.caption} />
            {gallery[lbIdx]?.caption && <p className="lb-caption">{gallery[lbIdx].caption}</p>}
          </div>
          <button className="lb-next" onClick={nextLb}>›</button>
        </div>
      )}

      <audio ref={audioRef} loop preload="auto" />
    </>
  );
}
