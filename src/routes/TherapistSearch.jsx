// src/routes/TherapistSearch.jsx
import React, { useEffect, useState } from 'react';
import {collection, getDocs, query, where} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import '../css/TherapistSearch.css';

const TherapistSearch = () => {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // search & filter states
  const [searchTerm, setSearchTerm]                   = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [selectedLanguages, setSelectedLanguages]     = useState([]);
  const [minRating, setMinRating]                     = useState(0);

  // fee slider ranges
  const [indRange, setIndRange]   = useState([0, 0]);
  const [grpRange, setGrpRange]   = useState([0, 0]);
  const [indBounds, setIndBounds] = useState([0,0]);
  const [grpBounds, setGrpBounds] = useState([0,0]);

  const [specialtiesList, setSpecialtiesList] = useState([]);
  const [languagesList, setLanguagesList]     = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const q = query(
            collection(db, 'therapists'),
            where('verified', '==', true)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        setTherapists(data);

        // build specialties & languages sets, and fee bounds
        const specs = new Set(), langs = new Set();
        const indFees = [], grpFees = [];

        data.forEach(t => {
          (t.specialties || '')
            .split(',')
            .map(s => s.trim())
            .forEach(s => s && specs.add(s));

          (t.languages || '')
            .split(',')
            .map(l => l.trim())
            .forEach(l => l && langs.add(l));

          const fi = parseFloat(t.feeIndividual) || 0;
          const fg = parseFloat(t.feeGroup)      || 0;
          indFees.push(fi);
          grpFees.push(fg);
        });

        setSpecialtiesList([...specs].sort());
        setLanguagesList([...langs].sort());

        if (indFees.length) {
          const minI = Math.min(...indFees), maxI = Math.max(...indFees);
          setIndBounds([minI, maxI]);
          setIndRange([minI, maxI]);
        }
        if (grpFees.length) {
          const minG = Math.min(...grpFees), maxG = Math.max(...grpFees);
          setGrpBounds([minG, maxG]);
          setGrpRange([minG, maxG]);
        }
      } catch (err) {
        console.error('Error fetching therapists:', err);
        setError('Failed to load therapists. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTherapists();
  }, []);

  const toggleFilter = (value, list, setList) => {
    setList(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const filteredTherapists = therapists.filter(t => {
    const term = searchTerm.toLowerCase();

    // 1) searchTerm must match name, field, specialties or languages
    const fullName  = `${t.firstName||''} ${t.lastName||''}`.toLowerCase();
    const field     = (t.field     || '').toLowerCase();
    const specsText = (t.specialties||'').toLowerCase();
    const langsText = (t.languages  || '').toLowerCase();
    if (
      !fullName.includes(term) &&
      !field.includes(term) &&
      !specsText.includes(term) &&
      !langsText.includes(term)
    ) return false;

    // 2) specialties filter
    if (selectedSpecialties.length) {
      const mySpecs = (t.specialties||'').split(',').map(s => s.trim());
      if (!selectedSpecialties.some(s => mySpecs.includes(s))) return false;
    }

    // 3) languages filter
    if (selectedLanguages.length) {
      const myLangs = (t.languages||'').split(',').map(l => l.trim());
      if (!selectedLanguages.some(l => myLangs.includes(l))) return false;
    }

    // 4) minimum rating filter
    if ((t.rating || 0) < minRating) return false;

    // 5) individual fee range
    const fi = parseFloat(t.feeIndividual) || 0;
    if (fi < indRange[0] || fi > indRange[1]) return false;

    // 6) group fee range
    const fg = parseFloat(t.feeGroup) || 0;
    if (fg < grpRange[0] || fg > grpRange[1]) return false;

    return true;
  });

  return (
    <div className="therapist-search-container">
      <h2>Find a Therapist</h2>

      {/* --- Search Bar --- */}
      <input
        className="search-input"
        type="text"
        placeholder="Search by name, field, specialty or language…"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      {/* --- Rating Filter --- */}
      <div className="rating-filter">
        <label>Min. Rating:</label>
        <select
          value={minRating}
          onChange={e => setMinRating(Number(e.target.value))}
        >
          {[0,1,2,3,4,5].map(n => (
            <option key={n} value={n}>
              {n === 0 ? 'Any' : `${n}★+`}
            </option>
          ))}
        </select>
      </div>

      {/* --- Fee Filters --- */}
      <div className="fee-filter">
        <div className="fee-range">
          <label>Individual Fee: ${indRange[0]} – ${indRange[1]}</label>
          <div className="range-sliders">
            <input
              type="range"
              min={indBounds[0]} max={indBounds[1]}
              value={indRange[0]}
              onChange={e => setIndRange([Math.min(+e.target.value, indRange[1]), indRange[1]])}
            />
            <input
              type="range"
              min={indBounds[0]} max={indBounds[1]}
              value={indRange[1]}
              onChange={e => setIndRange([indRange[0], Math.max(+e.target.value, indRange[0])])}
            />
          </div>
        </div>
        <div className="fee-range">
          <label>Group Fee: ${grpRange[0]} – ${grpRange[1]}</label>
          <div className="range-sliders">
            <input
              type="range"
              min={grpBounds[0]} max={grpBounds[1]}
              value={grpRange[0]}
              onChange={e => setGrpRange([Math.min(+e.target.value, grpRange[1]), grpRange[1]])}
            />
            <input
              type="range"
              min={grpBounds[0]} max={grpBounds[1]}
              value={grpRange[1]}
              onChange={e => setGrpRange([grpRange[0], Math.max(+e.target.value, grpRange[0])])}
            />
          </div>
        </div>
      </div>

      {/* --- Specialties --- */}
      <fieldset className="filters">
        <legend>Specialties</legend>
        {specialtiesList.map(spec => (
          <label key={spec}>
            <input
              type="checkbox"
              checked={selectedSpecialties.includes(spec)}
              onChange={() =>
                toggleFilter(spec, selectedSpecialties, setSelectedSpecialties)
              }
            />
            {spec}
          </label>
        ))}
      </fieldset>

      {/* --- Languages --- */}
      <fieldset className="filters">
        <legend>Languages</legend>
        {languagesList.map(lang => (
          <label key={lang}>
            <input
              type="checkbox"
              checked={selectedLanguages.includes(lang)}
              onChange={() =>
                toggleFilter(lang, selectedLanguages, setSelectedLanguages)
              }
            />
            {lang}
          </label>
        ))}
      </fieldset>

      {/* --- Loading / Error / No Results --- */}
      {loading && <div className="loading-spinner">Loading therapists…</div>}
      {error   && <p className="error-message">{error}</p>}

      {/* --- Therapist Cards --- */}
      {!loading && !error && (
        filteredTherapists.length > 0
          ? <div className="therapist-cards">
              {filteredTherapists.map(t => (
                <div
                  key={t.id}
                  className="therapist-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/account/${t.id}`)}
                  onKeyDown={e => e.key==='Enter' && navigate(`/account/${t.id}`)}
                >
                  <img
                    src={t.photoURL || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                    alt={`${t.firstName} ${t.lastName}`}
                  />
                  <h3>{t.firstName} {t.lastName}</h3>
                  <p><strong>Field:</strong> {t.field || 'General'}</p>
                  <p><strong>Rating:</strong> {(t.rating||0).toFixed(1)} ★</p>
                  <p><strong>Spec.:</strong> {t.specialties || '—'}</p>
                  <p><strong>Lang.:</strong> {t.languages   || '—'}</p>
                  <p><strong>Fee (Ind):</strong> ${t.feeIndividual || '0'}</p>
                  <p><strong>Fee (Grp):</strong> ${t.feeGroup      || '0'}</p>
                </div>
              ))}
            </div>
          : <p className="no-results">No therapists match your filters.</p>
      )}
    </div>
  );
};

export default TherapistSearch;
