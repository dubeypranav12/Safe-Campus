import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import CampusMap from '../components/CampusMap.jsx';
import { useIncidents } from '../context/IncidentContext.jsx';
import { LOCATIONS } from '../lib/constants.js';
import { SAMPLE_REPORTS, SAMPLE_VOICE } from '../data/content.js';

export default function ReportIncident() {
  const navigate = useNavigate();
  const { submitReport } = useIncidents();
  const [text, setText] = useState('');
  const [typed, setTyped] = useState(false);
  const [voiceUsed, setVoiceUsed] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState('');
  const [locationId, setLocationId] = useState('');
  const [locationSource, setLocationSource] = useState('unknown');
  const [locating, setLocating] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const recRef = useRef(null);

  useEffect(() => () => { recRef.current?.stop?.(); }, []);
  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl); }, [photoUrl]);

  const addText = (t) => setText((p) => (p ? `${p} ${t}` : t));

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceNote('');
    if (SR) {
      try {
        const rec = new SR();
        rec.lang = 'en-IN';
        rec.interimResults = false;
        rec.onresult = (e) => { addText(e.results[0][0].transcript); setVoiceUsed(true); setVoiceNote('Transcribed by your browser speech API.'); };
        rec.onend = () => setListening(false);
        rec.onerror = () => { setListening(false); setVoiceNote('Could not hear anything. You can type instead.'); };
        recRef.current = rec;
        setListening(true);
        rec.start();
        return;
      } catch (err) { /* fall through to simulation */ }
    }
    setListening(true);
    setTimeout(() => {
      addText(SAMPLE_VOICE);
      setVoiceUsed(true);
      setListening(false);
      setVoiceNote('Speech-to-text is simulated here (no speech API in this browser).');
    }, 1800);
  }

  function captureLocation() {
    setLocating(true);
    setTimeout(() => {
      setLocationId('library');
      setLocationSource('simulated GPS');
      setLocating(false);
    }, 900);
  }

  function onPhoto(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPhotoUrl(f.type.startsWith('image/') ? URL.createObjectURL(f) : null);
  }

  const modality = [];
  if (typed || (!voiceUsed && text.trim())) modality.push('text');
  if (voiceUsed) modality.push('voice');
  if (photo) modality.push('photo');
  const canSubmit = text.trim().length > 0 || !!photo;

  function send(panic) {
    const id = submitReport({
      text: text.trim(),
      locationId,
      locationSource: locationId ? locationSource : 'unknown',
      modality: panic ? ['panic button'] : modality.length ? modality : ['text'],
      panic,
      photoName: photo?.name,
    });
    navigate(`/incident/${id}`, { state: { justReported: true } });
  }

  return (
    <>
      <PageHeader eyebrow="Student view" title="Report an incident" subtitle="Use text, voice, a photo or the panic button. The urgent alert goes out first; questions and checks run alongside it." />
      <div className="container report-grid">
        <section className="card panic-card">
          <h2>Panic button</h2>
          <p>Sends an urgent alert immediately. Add details afterwards.</p>
          <button className="panic" onClick={() => send(true)}>
            <span>!</span>
            PANIC
          </button>
          <p className="muted small">Uses the location chosen on the right, if any. Prototype only: nothing is actually sent.</p>
        </section>

        <section className="card form-card">
          <h2>Describe what happened</h2>
          <label htmlFor="desc" className="sr-only">Description</label>
          <textarea id="desc" rows={5} value={text} placeholder="e.g. A student has collapsed near the library entrance…"
            onChange={(e) => { setText(e.target.value); setTyped(true); }} />
          <div className="quick">
            <span className="muted small">Try a sample:</span>
            {SAMPLE_REPORTS.map((s) => (
              <button key={s} type="button" className="chip-btn" onClick={() => { setText(s); setTyped(true); }}>{s.split(' ').slice(0, 5).join(' ')}…</button>
            ))}
          </div>

          <div className="inputs-row">
            <button type="button" className={`btn btn-soft${listening ? ' listening' : ''}`} onClick={startVoice} disabled={listening}>
              {listening ? '● Listening…' : '🎙 Add voice note'}
            </button>
            <label className="btn btn-soft file-btn">
              📷 {photo ? 'Change photo' : 'Add photo'}
              <input type="file" accept="image/*" onChange={onPhoto} hidden />
            </label>
          </div>
          {voiceNote && <p className="muted small">{voiceNote}</p>}
          {photo && (
            <div className="photo-preview">
              {photoUrl && <img src={photoUrl} alt="Attached preview" />}
              <span>{photo.name}</span>
              <button type="button" className="link-btn" onClick={() => { setPhoto(null); setPhotoUrl(null); }}>Remove</button>
            </div>
          )}

          <h3 className="mt">Location</h3>
          <div className="inputs-row">
            <select value={locationId} onChange={(e) => { setLocationId(e.target.value); setLocationSource('selected'); }} aria-label="Choose location">
              <option value="">Choose a place…</option>
              {LOCATIONS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <button type="button" className="btn btn-soft" onClick={captureLocation} disabled={locating}>
              {locating ? 'Locating…' : '📍 Capture my location'}
            </button>
          </div>
          <CampusMap mode="pick" pickedLocation={locationId} onPickLocation={(id) => { setLocationId(id); setLocationSource('selected'); }} />
          <p className="muted small">
            {locationId ? `Location: ${LOCATIONS.find((l) => l.id === locationId)?.name} (${locationSource})` : 'Tap a building on the map, choose from the list, or capture your location (simulated GPS).'}
          </p>

          <button className="btn btn-primary btn-lg" disabled={!canSubmit} onClick={() => send(false)}>Send report</button>
          {!canSubmit && <p className="muted small">Add a description or a photo to send a report.</p>}
        </section>
      </div>
    </>
  );
}
