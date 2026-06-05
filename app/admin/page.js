'use client';
// app/admin/page.js — Painel de Administração

import { useState, useEffect, useRef, useCallback } from 'react';
import './admin.css';

// ── Toast ─────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);
  return { toasts, add };
}

// ── PhotoUpload ───────────────────────────────────────────────────
function PhotoUpload({ value, onChange, label }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const upload = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) onChange(data.url);
      else alert('Erro no upload: ' + (data.error || 'tente novamente'));
    } catch (e) { alert('Erro no upload'); }
    setUploading(false);
  };

  return (
    <div className="field">
      <label className="field-lbl">{label || 'Foto'}</label>
      <div className={`photo-upload-wrap${value ? '' : ' empty'}`}>
        {value
          ? <img className="photo-preview" src={value} alt="preview" />
          : <div className="photo-preview" />}
        <div className="photo-upload-overlay">
          <span className="upload-icon">{uploading ? '⏳' : '📷'}</span>
          <span className="upload-text">{uploading ? 'Enviando...' : 'Clique para enviar'}</span>
          {!uploading && (
            <input className="upload-input" type="file" accept="image/*" ref={inputRef}
              onChange={e => e.target.files[0] && upload(e.target.files[0])} />
          )}
        </div>
      </div>
      <input className="field-input" type="text" value={value} placeholder="Ou cole a URL da foto"
        onChange={e => onChange(e.target.value)} style={{ marginTop: 6 }} />
    </div>
  );
}

// ── Componente de Item do Mapa (Autocomplete + Detalhes) ──────────
function MapLocationItem({ loc, idx, updateMap, removeMapLoc }) {
  const [query, setQuery] = useState(loc.name || '');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    setQuery(loc.name || '');
  }, [loc.name]);

  const handleSearchChange = (val) => {
    setQuery(val);
    updateMap(idx, 'name', val);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!val || val.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&addressdetails=1`);
        const data = await res.json();
        setSuggestions(data || []);
      } catch (e) {
        console.error("Erro ao buscar localidade:", e);
      }
      setSearching(false);
    }, 600);
  };

  const selectSuggestion = (s) => {
    updateMap(idx, 'name', s.display_name);
    updateMap(idx, 'lat', parseFloat(s.lat));
    updateMap(idx, 'lng', parseFloat(s.lon));
    setSuggestions([]);
  };

  return (
    <div className="map-adm-item" style={{ marginBottom: 16 }}>
      <div className="map-adm-body">
        {/* 1. Foto do local */}
        <div className="field full">
          <PhotoUpload
            value={loc.photo_url || ''}
            onChange={v => updateMap(idx, 'photo_url', v)}
            label="Foto do Local (Polaroid)"
          />
        </div>

        {/* 2. Autocomplete Local */}
        <div className="field full suggestions-wrap">
          <label className="field-lbl">Local (Completar automaticamente)</label>
          <input
            className="field-input"
            type="text"
            value={query}
            placeholder="Buscar local (ex: Miguel Pereira, Rio de Janeiro)"
            onChange={e => handleSearchChange(e.target.value)}
          />
          {searching && <div className="suggestion-loading">⏳ Buscando...</div>}
          {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((s, si) => (
                <li
                  key={si}
                  className="suggestion-item"
                  onClick={() => selectSuggestion(s)}
                  title={s.display_name}
                >
                  📍 {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Local Selecionado Informativo */}
        {loc.name && (
          <div className="field full">
            <label className="field-lbl">Local Selecionado</label>
            <div className="info-box" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              📍 {loc.name}
            </div>
          </div>
        )}

        {/* 3. Detalhes da Polaroid */}
        <div className="field full" style={{ marginTop: 6, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>
          <label className="field-lbl" style={{ color: 'var(--adm-purple)' }}>📸 Detalhes da Polaroid</label>
        </div>

        <div className="field">
          <label className="field-lbl">Apelido do Local (Opcional)</label>
          <input
            className="field-input"
            type="text"
            value={loc.nickname || ''}
            placeholder="Ex: Onde tudo começou"
            onChange={e => updateMap(idx, 'nickname', e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field-lbl">Texto da Polaroid (Opcional)</label>
          <input
            className="field-input"
            type="text"
            value={loc.photo_caption || ''}
            placeholder="Ex: sssss"
            onChange={e => updateMap(idx, 'photo_caption', e.target.value)}
          />
        </div>

        {/* 4. Mensagem e Data */}
        <div className="field full">
          <label className="field-lbl">Mensagem</label>
          <textarea
            className="field-textarea"
            rows={2}
            value={loc.description || ''}
            placeholder="Nossa viagem dos sonhos."
            onChange={e => updateMap(idx, 'description', e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field-lbl">Data da Visita</label>
          <input
            className="field-input"
            type="date"
            value={loc.date_visit || ''}
            onChange={e => updateMap(idx, 'date_visit', e.target.value)}
          />
        </div>

        {/* Coordenadas para visualização */}
        <div className="field">
          <label className="field-lbl">Coordenadas (Lat, Lng)</label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              className="field-input"
              type="number"
              step="0.0001"
              value={loc.lat || ''}
              placeholder="Lat"
              onChange={e => updateMap(idx, 'lat', parseFloat(e.target.value) || 0)}
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
            />
            <input
              className="field-input"
              type="number"
              step="0.0001"
              value={loc.lng || ''}
              placeholder="Lng"
              onChange={e => updateMap(idx, 'lng', parseFloat(e.target.value) || 0)}
              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
            />
          </div>
        </div>

      </div>
      <button className="btn btn-danger" style={{ marginTop: 14 }} onClick={() => removeMapLoc(idx, loc.id)}>🗑 Excluir Local</button>
    </div>
  );
}

// ── Página Admin ──────────────────────────────────────────────────
export default function Admin() {
  const [authed,  setAuthed]  = useState(false);
  const [pwd,     setPwd]     = useState('');
  const [pwdErr,  setPwdErr]  = useState(false);
  const [tab,     setTab]     = useState('casal');
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  // Dados
  const [cfg,      setCfg]      = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [gallery,  setGallery]  = useState([]);
  const [wordGame, setWordGame] = useState({ word: '', hint: '', title: '' });
  const [mapLocs,  setMapLocs]  = useState([]);
  const [openTl,   setOpenTl]   = useState(null); // index aberto na timeline

  const { toasts, add: toast } = useToast();

  // ── Autenticação ────────────────────────────────────────────────
  useEffect(() => {
    const s = sessionStorage.getItem('adm_ok');
    if (s) { setAuthed(true); loadAll(); }
  }, []);

  const login = async () => {
    const res = await fetch('/api/auth', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ password: pwd }) });
    const { ok } = await res.json();
    if (ok) {
      sessionStorage.setItem('adm_ok', '1');
      setAuthed(true); loadAll();
    } else {
      setPwdErr(true); setPwd('');
      setTimeout(() => setPwdErr(false), 3000);
    }
  };

  // ── Carregar dados ──────────────────────────────────────────────
  const loadAll = async () => {
    const [c, tl, gal, wg, mp] = await Promise.all([
      fetch('/api/config').then(r => r.json()),
      fetch('/api/timeline').then(r => r.json()),
      fetch('/api/gallery').then(r => r.json()),
      fetch('/api/word-game').then(r => r.json()),
      fetch('/api/map').then(r => r.json()),
    ]);
    setCfg(c);
    setTimeline(tl);
    setGallery(gal);
    setWordGame(wg);
    setMapLocs(mp);
  };

  // ── Salvar tudo ─────────────────────────────────────────────────
  const saveAll = async () => {
    setSaving(true); setSaved(false);
    toast('💾 Salvando...', 'saving');
    try {
      // Config
      await fetch('/api/config', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(cfg) });
      // Timeline (salvar cada item individualmente)
      for (const item of timeline) {
        await fetch('/api/timeline', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(item) });
      }
      // Gallery
      for (const photo of gallery) {
        await fetch('/api/gallery', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(photo) });
      }
      // Word Game
      await fetch('/api/word-game', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(wordGame) });
      // Map
      for (const loc of mapLocs) {
        await fetch('/api/map', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(loc) });
      }
      setSaved(true); toast('✅ Tudo salvo com sucesso!', 'success');
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      toast('❌ Erro ao salvar: ' + e.message, 'error');
    }
    setSaving(false);
  };

  // ── Timeline helpers ───────────────────────────────────────────
  const addTlItem = () => {
    const next = [...timeline, { date_event:'', emoji:'⭐', title:'', description:'', photo_url:'', photo_caption:'', sort_order: timeline.length }];
    setTimeline(next); setOpenTl(next.length - 1);
  };
  const removeTlItem = async (idx, id) => {
    if (!confirm('Excluir este marco?')) return;
    if (id) { await fetch('/api/timeline', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) }); }
    setTimeline(t => t.filter((_,i) => i !== idx));
    toast('Marco excluído', 'success');
  };
  const updateTl = (idx, key, val) => setTimeline(t => t.map((x,i) => i===idx ? {...x,[key]:val} : x));

  // ── Gallery helpers ────────────────────────────────────────────
  const addGallery = () => setGallery(g => [...g, { src:'', caption:'', sort_order: g.length }]);
  const removeGallery = async (idx, id) => {
    if (id) { await fetch('/api/gallery', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) }); }
    setGallery(g => g.filter((_,i) => i!==idx));
    toast('Foto excluída', 'success');
  };
  const updateGallery = (idx, key, val) => setGallery(g => g.map((x,i) => i===idx ? {...x,[key]:val} : x));

  // ── Map helpers ────────────────────────────────────────────────
  const addMapLoc = () => setMapLocs(m => [...m, { name:'', lat:0, lng:0, description:'', date_visit:'', photo_url:'', photo_caption:'', nickname:'', sort_order: m.length }]);
  const removeMapLoc = async (idx, id) => {
    if (id) { await fetch('/api/map', { method:'DELETE', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) }); }
    setMapLocs(m => m.filter((_,i) => i!==idx));
    toast('Local excluído', 'success');
  };
  const updateMap = (idx, key, val) => setMapLocs(m => m.map((x,i) => i===idx ? {...x,[key]:val} : x));

  const fmtDate = (d) => { try { return new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'}); } catch { return d||''; } };

  // ─────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────

  // Tela de Senha
  if (!authed) return (
    <div className="lock-screen">
      <div className="lock-box">
        <div className="lock-icon">🔐</div>
        <h1 className="lock-title">Painel Admin</h1>
        <p className="lock-sub">Digite a senha para continuar</p>
        <div className="lock-field">
          <input className="lock-input" type="password" value={pwd}
            placeholder="Senha..." onChange={e => setPwd(e.target.value)}
            onKeyDown={e => e.key==='Enter' && login()} />
          <button className="lock-btn" onClick={login}>Entrar →</button>
        </div>
        {pwdErr && <p className="lock-error">❌ Senha incorreta</p>}
        <a href="/" className="lock-link">← Voltar ao site</a>
      </div>
    </div>
  );

  if (!cfg) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#08081a', color:'#a78bfa', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:'2.5rem', animation:'spin 1s linear infinite' }}>💫</div>
      <p>Carregando...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const tabs = [
    { id:'casal',    label:'👫 Casal' },
    { id:'musica',   label:'🎵 Música' },
    { id:'mensagem', label:'💌 Mensagem' },
    { id:'timeline', label:'📖 Timeline' },
    { id:'galeria',  label:'📸 Galeria' },
    { id:'jogo',     label:'🎮 Jogo' },
    { id:'mapa',     label:'🗺️ Mapa' },
    { id:'estrelas', label:'⭐ Estrelas' },
  ];

  return (
    <>
      {/* Header */}
      <header className="adm-header">
        <div className="adm-logo">💖 Admin</div>
        <nav className="adm-nav">
          {tabs.map(t => (
            <button key={t.id} className={`adm-nav-btn${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexShrink:0 }}>
          <a href="/" target="_blank" className="preview-link">👁 Ver site</a>
          <button className={`adm-save-btn${saving?' saving':''}${saved?' saved':''}`} onClick={saveAll} disabled={saving}>
            {saving ? '⏳ Salvando...' : saved ? '✅ Salvo!' : '💾 Salvar'}
          </button>
        </div>
      </header>

      <div className="adm-body">

        {/* ── Tab: Casal ── */}
        {tab === 'casal' && (
          <div className="adm-tab active">
            <div className="adm-card">
              <div className="adm-card-title">👫 Nomes do Casal</div>
              <div className="field-row">
                <div className="field">
                  <label className="field-lbl">Nome 1 (Ela)</label>
                  <input className="field-input" type="text" value={cfg.name1||''} placeholder="Nome dela"
                    onChange={e => setCfg({...cfg, name1: e.target.value})} />
                </div>
                <div className="field">
                  <label className="field-lbl">Nome 2 (Ele)</label>
                  <input className="field-input" type="text" value={cfg.name2||''} placeholder="Nome dele"
                    onChange={e => setCfg({...cfg, name2: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="adm-card">
              <div className="adm-card-title">📅 Data do Relacionamento</div>
              <div className="field">
                <label className="field-lbl">Data de início (ou data do casamento)</label>
                <input className="field-input" type="datetime-local" value={(cfg.start_date||'').substring(0,16)}
                  onChange={e => setCfg({...cfg, start_date: e.target.value+':00'})} />
              </div>
              <div className="field" style={{marginTop:14}}>
                <label className="field-lbl">Rótulo do contador</label>
                <input className="field-input" type="text" value={cfg.counter_label||'Juntos há'} placeholder="Juntos há · Casados há"
                  onChange={e => setCfg({...cfg, counter_label: e.target.value})} />
              </div>
              <div className="info-box" style={{marginTop:14}}>
                💡 Data <strong>passada</strong> = conta o tempo juntos.<br/>
                Data <strong>futura</strong> = regressiva (ótimo para casamentos!)
              </div>
            </div>
            <div className="adm-card">
              <div className="adm-card-title">🔤 Textos</div>
              <div className="field">
                <label className="field-lbl">Título da tela de entrada</label>
                <input className="field-input" type="text" value={cfg.entry_title||''} placeholder="Nossa História ✨"
                  onChange={e => setCfg({...cfg, entry_title: e.target.value})} />
              </div>
              <div className="field" style={{marginTop:14}}>
                <label className="field-lbl">Subtítulo da tela de entrada</label>
                <input className="field-input" type="text" value={cfg.entry_subtitle||''} placeholder="Um presente especial..."
                  onChange={e => setCfg({...cfg, entry_subtitle: e.target.value})} />
              </div>
              <div className="field" style={{marginTop:14}}>
                <label className="field-lbl">Frase abaixo dos nomes</label>
                <input className="field-input" type="text" value={cfg.hero_tagline||''} placeholder="Juntos desde sempre, para sempre"
                  onChange={e => setCfg({...cfg, hero_tagline: e.target.value})} />
              </div>
            </div>
            <div className="adm-card">
              <div className="adm-card-title">🔐 Segurança</div>
              <div className="field">
                <label className="field-lbl">Senha do painel admin</label>
                <input className="field-input" type="text" value={cfg.admin_password||''} placeholder="Sua senha"
                  onChange={e => setCfg({...cfg, admin_password: e.target.value})} />
              </div>
              <div className="info-box" style={{marginTop:12}}>⚠️ Após trocar a senha, clique <strong>Salvar</strong> e recarregue a página para fazer login novamente.</div>
            </div>
          </div>
        )}

        {/* ── Tab: Música ── */}
        {tab === 'musica' && (
          <div className="adm-tab active">
            <div className="adm-card">
              <div className="adm-card-title">🎵 Música de Fundo</div>
              <div className="field">
                <label className="field-lbl">URL do arquivo MP3</label>
                <input className="field-input" type="text" value={cfg.music_url||''} placeholder="https://... ou URL pública do Spotify/SoundCloud"
                  onChange={e => setCfg({...cfg, music_url: e.target.value})} />
              </div>
              <div className="field-row" style={{marginTop:14}}>
                <div className="field">
                  <label className="field-lbl">Nome da música</label>
                  <input className="field-input" type="text" value={cfg.music_song||''} placeholder="Perfect"
                    onChange={e => setCfg({...cfg, music_song: e.target.value})} />
                </div>
                <div className="field">
                  <label className="field-lbl">Artista</label>
                  <input className="field-input" type="text" value={cfg.music_artist||''} placeholder="Ed Sheeran"
                    onChange={e => setCfg({...cfg, music_artist: e.target.value})} />
                </div>
              </div>
              <div className="info-box" style={{marginTop:14}}>
                🎵 Cole a URL direta de um <code>.mp3</code>.<br/>
                Sites que funcionam: <code>Dropbox</code> (link direto), <code>Google Drive</code> (link de download), <code>Vercel Blob</code>.
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Mensagem ── */}
        {tab === 'mensagem' && (
          <div className="adm-tab active">
            <div className="adm-card">
              <div className="adm-card-title">💌 Mensagem Especial (Envelope)</div>
              <div className="field">
                <label className="field-lbl">Mensagem (fica no envelope até clicar)</label>
                <textarea className="field-textarea" rows={6} value={cfg.special_message||''} placeholder="Escreva sua mensagem com todo o amor..."
                  onChange={e => setCfg({...cfg, special_message: e.target.value})} />
              </div>
              <div className="field" style={{marginTop:14}}>
                <label className="field-lbl">Assinatura</label>
                <input className="field-input" type="text" value={cfg.message_signature||''} placeholder="Com todo o meu amor 💖"
                  onChange={e => setCfg({...cfg, message_signature: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Timeline ── */}
        {tab === 'timeline' && (
          <div className="adm-tab active">
            <div className="adm-card">
              <div className="adm-card-title">
                📖 Linha do Tempo
                <span className="badge">{timeline.length} marcos</span>
              </div>
              <div className="tl-list">
                {timeline.map((item, idx) => (
                  <div key={idx} className={`tl-item${openTl===idx?' open':''}`}>
                    <div className="tl-item-head" onClick={() => setOpenTl(openTl===idx ? null : idx)}>
                      <span className="tl-item-emoji">{item.emoji||'⭐'}</span>
                      <div className="tl-item-info">
                        <div className="tl-item-ttl">{item.title||'Sem título'}</div>
                        <div className="tl-item-dt">{fmtDate(item.date_event)}</div>
                      </div>
                      <button className="btn btn-danger" onClick={e=>{e.stopPropagation();removeTlItem(idx,item.id);}}>🗑</button>
                      <span className="tl-item-chevron">▼</span>
                    </div>
                    <div className="tl-item-body">
                      <div className="field">
                        <label className="field-lbl">Emoji</label>
                        <input className="field-input" type="text" value={item.emoji||''} placeholder="💖"
                          style={{textAlign:'center',fontSize:'1.3rem'}}
                          onChange={e => updateTl(idx,'emoji',e.target.value)} />
                      </div>
                      <div className="field">
                        <label className="field-lbl">Data</label>
                        <input className="field-input" type="date" value={item.date_event||''}
                          onChange={e => updateTl(idx,'date_event',e.target.value)} />
                      </div>
                      <div className="field full">
                        <label className="field-lbl">Título</label>
                        <input className="field-input" type="text" value={item.title||''} placeholder="O dia em que nos encontramos"
                          onChange={e => updateTl(idx,'title',e.target.value)} />
                      </div>
                      <div className="field full">
                        <label className="field-lbl">Descrição</label>
                        <textarea className="field-textarea" rows={2} value={item.description||''} placeholder="Conte o que aconteceu..."
                          onChange={e => updateTl(idx,'description',e.target.value)} />
                      </div>
                      <div className="field full">
                        <PhotoUpload value={item.photo_url||''} onChange={v => updateTl(idx,'photo_url',v)} label="Foto da Polaroid (opcional)" />
                      </div>
                      <div className="field full">
                        <label className="field-lbl">Legenda da foto</label>
                        <input className="field-input" type="text" value={item.photo_caption||''} placeholder="Uma legenda carinhosa..."
                          onChange={e => updateTl(idx,'photo_caption',e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost" style={{marginTop:16}} onClick={addTlItem}>➕ Adicionar Marco</button>
            </div>
          </div>
        )}

        {/* ── Tab: Galeria ── */}
        {tab === 'galeria' && (
          <div className="adm-tab active">
            <div className="adm-card">
              <div className="adm-card-title">
                📸 Galeria de Fotos
                <span className="badge">{gallery.length} fotos</span>
              </div>
              <div className="gallery-list">
                {gallery.map((photo, idx) => (
                  <div key={idx} className="gallery-adm-item">
                    <span className="gallery-adm-num">{idx+1}</span>
                    {photo.src
                      ? <img className="gallery-adm-thumb" src={photo.src} alt="" onError={e=>e.target.style.opacity='.2'} />
                      : <div className="gallery-adm-thumb" style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem'}}>📷</div>
                    }
                    <div className="gallery-adm-fields">
                      <input className="field-input" type="text" placeholder="URL ou use o upload abaixo" value={photo.src||''}
                        onChange={e => updateGallery(idx,'src',e.target.value)} />
                      <input className="field-input" type="text" placeholder="Legenda" value={photo.caption||''}
                        onChange={e => updateGallery(idx,'caption',e.target.value)} />
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:6,flexShrink:0}}>
                      <label className="btn btn-ghost btn-sm" style={{cursor:'pointer',position:'relative',overflow:'hidden'}}>
                        📷 Upload
                        <input type="file" accept="image/*" style={{position:'absolute',inset:0,opacity:0,cursor:'pointer'}}
                          onChange={async e => {
                            if(!e.target.files[0]) return;
                            const fd = new FormData(); fd.append('file',e.target.files[0]);
                            const res = await fetch('/api/upload',{method:'POST',body:fd});
                            const d = await res.json();
                            if(d.url) updateGallery(idx,'src',d.url);
                          }} />
                      </label>
                      <button className="btn btn-danger" onClick={() => removeGallery(idx,photo.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost" style={{marginTop:16}} onClick={addGallery}>➕ Adicionar Foto</button>
            </div>
          </div>
        )}

        {/* ── Tab: Jogo ── */}
        {tab === 'jogo' && (
          <div className="adm-tab active">
            <div className="adm-card">
              <div className="adm-card-title">🎮 Jogo de Palavras (Forca)</div>
              <div className="field">
                <label className="field-lbl">Título da seção</label>
                <input className="field-input" type="text" value={wordGame.title||''} placeholder="O que mais gosto em você"
                  onChange={e => setWordGame({...wordGame, title: e.target.value})} />
              </div>
              <div className="field" style={{marginTop:14}}>
                <label className="field-lbl">Palavra secreta</label>
                <input className="field-input" type="text" value={wordGame.word||''} placeholder="AMOR (só letras, sem espaço)"
                  style={{textTransform:'uppercase',fontSize:'1.2rem',letterSpacing:4,textAlign:'center'}}
                  onChange={e => setWordGame({...wordGame, word: e.target.value.toUpperCase()})} />
              </div>
              <div className="field" style={{marginTop:14}}>
                <label className="field-lbl">Dica (opcional)</label>
                <input className="field-input" type="text" value={wordGame.hint||''} placeholder="O que sinto por você todos os dias"
                  onChange={e => setWordGame({...wordGame, hint: e.target.value})} />
              </div>
              <div className="info-box" style={{marginTop:14}}>
                💡 A pessoa vai adivinhar letra por letra. Use palavras como <code>AMOR</code>, <code>SAUDADE</code>, ou o nome dela/dele!
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Mapa ── */}
        {tab === 'mapa' && (
          <div className="adm-tab active">
            <div className="adm-card">
              <div className="adm-card-title">
                🗺️ Nossa Jornada no Mapa
                <span className="badge">{mapLocs.length} locais</span>
              </div>
              <div className="map-list">
                {mapLocs.map((loc, idx) => (
                  <MapLocationItem
                    key={idx}
                    loc={loc}
                    idx={idx}
                    updateMap={updateMap}
                    removeMapLoc={removeMapLoc}
                  />
                ))}
              </div>
              <button className="btn btn-ghost" style={{marginTop:16}} onClick={addMapLoc}>➕ Adicionar Local</button>
            </div>
          </div>
        )}

        {/* ── Tab: Estrelas ── */}
        {tab === 'estrelas' && (
          <div className="adm-tab active">
            <div className="adm-card">
              <div className="adm-card-title">⭐ Mapa das Estrelas</div>
              <div className="field">
                <label className="field-lbl">Data especial (ex: dia do primeiro encontro)</label>
                <input className="field-input" type="date" value={cfg.star_date||''}
                  onChange={e => setCfg({...cfg, star_date: e.target.value})} />
              </div>
              <div className="field-row" style={{marginTop:14}}>
                <div className="field">
                  <label className="field-lbl">Latitude do local</label>
                  <input className="field-input" type="number" value={cfg.star_lat||''} step="0.0001" placeholder="-23.5505"
                    onChange={e => setCfg({...cfg, star_lat: parseFloat(e.target.value)})} />
                </div>
                <div className="field">
                  <label className="field-lbl">Longitude do local</label>
                  <input className="field-input" type="number" value={cfg.star_lng||''} step="0.0001" placeholder="-46.6333"
                    onChange={e => setCfg({...cfg, star_lng: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="field" style={{marginTop:14}}>
                <label className="field-lbl">Título abaixo do mapa</label>
                <input className="field-input" type="text" value={cfg.star_title||''} placeholder="O céu quando nossos mundos se colidiram"
                  onChange={e => setCfg({...cfg, star_title: e.target.value})} />
              </div>
              <div className="info-box" style={{marginTop:14}}>
                🌟 O mapa gera uma constelação baseada na data e local que você inserir.<br/>
                Para São Paulo use: <code>-23.5505</code>, <code>-46.6333</code>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Toasts */}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </>
  );
}
