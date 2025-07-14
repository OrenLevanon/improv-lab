import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';

// === TYPE DEFINITIONS (Unchanged) ===
type ChordType = 'maj7' | 'min7' | 'dom7';
type TextCategory = 'triads' | 'triads_plus_one' | 'pentatonics' | 'pairs';
interface Chord { name: string; type: ChordType; audioFile: string; bassFile?: string; texts: Partial<Record<TextCategory, string[]>>; }

// === CHORD DATA (UPDATED) ===
const CHORDS: Chord[] = [
  {
    name: "Cmaj7",
    type: "maj7",
    audioFile: "gtr_cmaj7.wav",
    bassFile: "bass_c.wav",
    texts: {
      triads: [
        "D major triad",
        "G major triad",
        "A minor triad",
        "B minor triad",
        "D sus2",
        "E sus2",
        "G sus2",
        "D sus4",
        "E sus4",
        "G sus4"
      ],
      triads_plus_one: [
        "Dmaj add2",
        "Dmaj add4",
        "Emin add2",
        "Emin add4",
        "Gmaj add2",
        "Gmaj add4",
        "Amin add2",
        "Amin add4",
        "Bmin add4"
      ],
      pentatonics: ["Cmaj pentatonic", "Dmaj pentatonic", "Emin pentatonic", "Gmaj pentatonic", "Bmin pentatonic"],
      pairs: ["Cmaj / Dmaj", "Bmin / Cmaj", "Dmaj / Emin"]
    }
  },
  {
    name: "G7Alt",
    type: "dom7",
    audioFile: "gtr_galt.wav",
    bassFile: "bass_g.wav",
    texts: {
      triads: [
        "Ab minor triad",
        "Bb minor triad",
        "Db major triad",
        "Eb major triad",
        "Ab sus2",
        "Ab sus4",
        "Bb susb2",
        "Bb sus4",
        "Db sus2",
        "Db sus#4",
        "Eb sus2",
        "Eb sus4"
      ],
      triads_plus_one: [
        "Abmin add2",
        "Abmin add4",
        "Bbmin addb2",
        "Bbmin add4",
        "Dbmaj add2",
        "Dbmaj add#4",
        "Ebmaj add2",
        "Ebmaj add4"
      ],
      pentatonics: ["Abmin6 pentatonic", "Dbmaj pentatonic", "Ebmaj pentatonic"],
      pairs: ["Abmin / Bbmin", "Dbmaj / Ebmaj", "Abmin / Gdim"]
    }
  },
  {
    name: "G7b9",
    type: "dom7",
    audioFile: "gtr_g7b9.wav",
    bassFile: "bass_g.wav",
    texts: {
      triads: [
        "Bb major triad",
        "Bb minor triad",
        "Db major triad",
        "Db minor triad",
        "E major triad",
        "E minor triad"
      ],
      triads_plus_one: [
        "Bbmaj addb2",
        "Bbmaj add#4",
        "Bbmaj6",
        "Bbmin6",
        "Dbmaj addb2",
        "Dbmaj add#4",
        "Dbmaj6",
        "Dbmin6",
        "Emaj addb2",
        "Emaj add#4",
        "Emaj6",
        "Emin6"
      ],
      pentatonics: ["Bb7b9 pentatonic", "Db7b9 pentatonic", "E7b9 pentatonic"],
      pairs: ["Triad pairs: Gmaj / Dbmaj", "Gmaj / Dbmin", "Gmaj / Bbmin", "Emaj / Bbmin"]
    }
  },
  {
    name: "Cmin7",
    type: "min7",
    audioFile: "gtr_cmin7.wav",
    bassFile: "bass_c.wav",
    texts: {
      triads: [
        "D minor triad",
        "Eb major triad",
        "F major triad",
        "G minor triad",
        "Bb major triad",
        "Eb sus2",
        "F sus2",
        "G sus2",
        "Eb sus#4",
        "F sus4",
        "G sus4"
      ],
      triads_plus_one: [
        "Dmin addb2",
        "Dmin add4",
        "Ebmaj add2",
        "Ebmaj add#4",
        "Fmaj add2",
        "Fmaj add4",
        "Gmin add2",
        "Gmin add4",
        "Bbmaj add2",
        "Bbmaj add4"
      ],
      pentatonics: ["Cmin pentatonic", "Dmin pentatonic", "Gmin pentatonic"],
      pairs: ["Cmin / Dmin", "Dmin / Ebmaj", "Ebmaj / Fmaj"]
    }
  },
  {
    name: "Abmaj7",
    type: "maj7",
    audioFile: "gtr_abmaj7.wav",
    bassFile: "bass_ab.wav",
    texts: {
      triads: [
        "Bb major triad",
        "Eb major triad",
        "F minor triad",
        "G minor triad",
        "Bb sus2",
        "C sus2",
        "Eb sus2",
        "Bb sus4",
        "C sus4",
        "Eb sus4"
      ],
      triads_plus_one: [
        "Bbmaj add2",
        "Bbmaj add4",
        "Cmin add2",
        "Cmin add4",
        "Ebmaj add2",
        "Ebmaj add4",
        "Fmin add2",
        "Fmin add4",
        "Gmin addb2",
        "Gmin add4"
      ],
      pentatonics: ["Abmaj pentatonic", "Bbmaj pentatonic", "Cmin pentatonic", "Ebmaj pentatonic", "Gmin pentatonic"],
      pairs: ["Abmaj / Bbmaj", "Gmin / Abmaj", "Bbmaj / Cmin"]
    }
  },
  {
    name: "Fmaj7",
    type: "maj7",
    audioFile: "gtr_fmaj7.wav",
    bassFile: "bass_f.wav",
    texts: {
      triads: [
        "G major triad",
        "C major triad",
        "D minor triad",
        "E minor triad",
        "G sus2",
        "A sus2",
        "C sus2",
        "G sus4",
        "A sus4",
        "C sus4"
      ],
      triads_plus_one: [
        "Gmaj add2",
        "Gmaj add4",
        "Amin add2",
        "Amin add4",
        "Cmaj add2",
        "Cmaj add4",
        "Dmin add2",
        "Dmin add4",
        "Emin add4"
      ],
      pentatonics: ["Fmaj pentatonic", "Gmaj pentatonic", "Amin pentatonic", "Dmin pentatonic", "Emin pentatonic"],
      pairs: ["Fmaj / Gmaj", "Fmaj / Emin", "Cmaj / Dmin"]
    }
  },
  {
    name: "Dmin7",
    type: "min7",
    audioFile: "gtr_dmin7.wav",
    bassFile: "bass_d.wav",
    texts: {
      triads: [
        "E minor triad",
        "F major triad",
        "G major triad",
        "A minor triad",
        "C major triad",
        "F sus2",
        "G sus2",
        "A sus2",
        "F sus#4",
        "G sus4",
        "A sus4"
      ],
      triads_plus_one: [
        "Emin addb2",
        "Emin add4",
        "Fmaj add2",
        "Fmaj add#4",
        "Gmaj add2",
        "Gmaj add4",
        "Amin add2",
        "Amin add4",
        "Cmaj add2",
        "Cmaj add4"
      ],
      pentatonics: ["Dmin pentatonic", "Emin pentatonic", "Fmaj pentatonic", "Gmaj pentatonic", "Amin pentatonic"],
      pairs: ["Dmin / Emin", "Fmaj / Emin", "Gmaj / Amin"]
    }
  },
  {
    name: "Fmin7",
    type: "min7",
    audioFile: "gtr_fmin7.wav",
    bassFile: "bass_f.wav",
    texts: {
      triads: [
        "G minor triad",
        "Ab major triad",
        "Bb major triad",
        "C minor triad",
        "Eb major triad",
        "Ab sus2",
        "Bb sus2",
        "C sus2",
        "Ab sus4",
        "Bb sus4",
        "C sus4"
      ],
      triads_plus_one: [
        "Gmin addb2",
        "Gmin add4",
        "Abmaj add2",
        "Abmaj add#4",
        "Bbmaj add2",
        "Bbmaj add4",
        "Cmin add2",
        "Cmin add4",
        "Ebmaj add2",
        "Ebmaj add4"
      ],
      pentatonics: ["Fmin pentatonic", "Gmin pentatonic", "Abmaj pentatonic", "Bbmaj pentatonic", "Cmin pentatonic"],
      pairs: ["Fmin / Gmin", "Abmaj / Bbmaj", "Bbmaj / Cmin"]
    }
  },
  {
    name: "D7b9",
    type: "dom7",
    audioFile: "gtr_d7b9.wav",
    bassFile: "bass_d.wav",
    texts: {
      triads: [
        "F major triad",
        "F minor triad",
        "Ab major triad",
        "Ab minor triad",
        "B major triad",
        "B minor triad"
      ],
      triads_plus_one: [
        "Fmaj addb2",
        "Fmaj add#4",
        "Fmin6",
        "Fmaj6",
        "Abmaj addb2",
        "Abmaj add#4",
        "Abmin6",
        "Abmaj6",
        "Bmaj add2",
        "Bmaj add#4",
        "Bmin6",
        "Bmaj6"
      ],
      pentatonics: ["F7b9 pentatonic", "Ab7b9 pentatonic", "B7b9 pentatonic"],
      pairs: ["Triad pairs: Dmaj / Abmaj", "Dmaj / Abmin", "Dmaj / Fmin", "Bmaj / Fmin"]
    }
  }
];

const BEAT_INTERVAL_SEC = 60 / 135;
const PREVIEW_OFFSET_MS = BEAT_INTERVAL_SEC * 8 * 1000;

const CHORD_TYPE_OPTIONS: { value: ChordType; label: string }[] = [ { value: 'maj7', label: 'Major 7th' }, { value: 'min7', label: 'Minor 7th' }, { value: 'dom7', label: 'Dominant 7th' }, ];
const TEXT_TYPE_OPTIONS: { value: TextCategory; label: string }[] = [ { value: 'triads', label: 'Triads' }, { value: 'triads_plus_one', label: 'Triads + 1 Note' }, { value: 'pentatonics', label: 'Pentatonics' }, { value: 'pairs', label: 'Triad Pairs' }, ];

// === DROPDOWN COMPONENTS ===
function CustomSelect<T extends string | number>({ options, value, onChange }: { options: { value: T; label: string }[], value: T, onChange: (v: T) => void }) { /* (Unchanged) */
  const [isOpen, setIsOpen] = useState(false); const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const handleClickOutside = (e: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
  return ( <div ref={wrapperRef} style={styles.selectWrapper}> <button style={styles.selectButton} onClick={() => setIsOpen(!isOpen)}> {options.find(opt => opt.value === value)?.label} <span style={{...styles.selectArrow, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span> </button> {isOpen && ( <ul style={styles.selectDropdown}> {options.map(option => ( <li key={String(option.value)} style={styles.selectOption} onClick={() => { onChange(option.value); setIsOpen(false); }}> {option.label} </li> ))} </ul> )} </div> );
}

// Multi-Select Dropdown (Updated)
function MultiSelectDropdown<T extends string>({ options, selected, onChange, label, allText }: { options: { value: T; label: string }[], selected: Record<T, boolean>, onChange: (s: Record<T, boolean>) => void, label: string, allText?: string }) {
  const [isOpen, setIsOpen] = useState(false); const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedCount = Object.values(selected).filter(Boolean).length;
  const allSelected = selectedCount === options.length;

  const getButtonText = () => {
    if (allSelected || selectedCount === 0) return allText || `All ${label}`; // Use custom `allText` if provided
    if (selectedCount === 1) return options.find(opt => selected[opt.value])?.label || '';
    return `${selectedCount} of ${options.length} selected`;
  };

  const handleSelectAll = () => { onChange(Object.fromEntries(options.map(opt => [opt.value, !allSelected])) as Record<T, boolean>); };
  useEffect(() => { const handleClickOutside = (e: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
  return ( <div ref={wrapperRef} style={styles.selectWrapper}> <button style={styles.selectButton} onClick={() => setIsOpen(!isOpen)}> {getButtonText()} <span style={{...styles.selectArrow, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span> </button> {isOpen && ( <ul style={styles.selectDropdown}> <li style={styles.selectOption} onClick={handleSelectAll}> <div style={styles.checkbox} data-checked={allSelected}>✓</div>Select All </li> {options.map(option => ( <li key={option.value} style={styles.selectOption} onClick={() => onChange({ ...selected, [option.value]: !selected[option.value] })}> <div style={styles.checkbox} data-checked={!!selected[option.value]}>✓</div>{option.label} </li> ))} </ul> )} </div> );
}

export default function Home() {
  const [currentChord, setCurrentChord] = useState<Chord | null>(null);
  const [customText, setCustomText] = useState<string>("Select your settings and press play");
  const [nextText, setNextText] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [barsPerChord, setBarsPerChord] = useState<number>(8);
  const [chordFilters, setChordFilters] = useState<Record<ChordType, boolean>>(Object.fromEntries(CHORD_TYPE_OPTIONS.map(opt => [opt.value, true])) as Record<ChordType, boolean>);
  const [textFilters, setTextFilters] = useState<Record<TextCategory, boolean>>(Object.fromEntries(TEXT_TYPE_OPTIONS.map(opt => [opt.value, true])) as Record<TextCategory, boolean>);
  // === CUSTOM CHORDS STATE ===
  const [customChords, setCustomChords] = useState<string[]>(["", "", "", ""]);
  const [useCustomChords, setUseCustomChords] = useState(false);
  const customChordIndex = useRef(0);

  function handleCustomChordChange(idx: number, value: string) {
    setCustomChords(prev => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }

  const contextRef = useRef<AudioContext | null>(null);
  const bufferRefs = useRef<Record<string, AudioBuffer>>({});
  const currentSources = useRef<AudioBufferSourceNode[]>([]);
  const loopTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastPlayedRef = useRef<{ chordName: string; text: string } | null>(null);
  const availableChords = useMemo(() => CHORDS.filter(chord => chordFilters[chord.type]), [chordFilters]);
  const availableTextCategories = useMemo(() => Object.keys(textFilters).filter(key => textFilters[key as TextCategory]) as TextCategory[], [textFilters]);
  
  useEffect(() => {
    if (typeof window === "undefined") return; // Prevents running on server
    // Audio initialization... unchanged
    const initAudio = async () => {
      // Fix for no-explicit-any: use unknown instead of any
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = new AudioContextClass();
      contextRef.current = context;
      const allFiles = new Set<string>(["drumgroove_135.wav"]);
      CHORDS.forEach(c => { allFiles.add(c.audioFile); if (c.bassFile) allFiles.add(c.bassFile); });
      await Promise.all(
        Array.from(allFiles).map(async file => {
          try {
            const response = await fetch(`/sounds/${file}`);
            if (!response.ok) throw new Error(`Failed to load ${file}`);
            const arrayBuffer = await response.arrayBuffer();
            bufferRefs.current[file] = await context.decodeAudioData(arrayBuffer);
          } catch (e) {
            console.error(e);
            setCustomText(`Error: Could not load sound /sounds/${file}`);
          }
        })
      );
      if (context.state === 'running') context.suspend();
    };
    initAudio();
  }, []);

  const stopAllAudio = () => { /* (Unchanged) */ currentSources.current.forEach(src => { try { src.stop(); } catch { } }); currentSources.current = []; };
  const playChord = useCallback((chord: Chord, text: string) => { /* (Unchanged) */ const context = contextRef.current; if (!context) return; stopAllAudio(); ["drumgroove_135.wav", chord.audioFile, chord.bassFile].forEach(file => { if (file && bufferRefs.current[file]) { const src = context.createBufferSource(); src.buffer = bufferRefs.current[file]; src.loop = true; src.connect(context.destination); src.start(); currentSources.current.push(src); } }); setCurrentChord(chord); setCustomText(text); setNextText("..."); lastPlayedRef.current = { chordName: chord.name, text }; }, []);
  const getRandomFilteredText = useCallback((chord: Chord): string | null => { /* (Unchanged) */ const possibleTexts = availableTextCategories.flatMap(cat => chord.texts[cat] || []); if (possibleTexts.length === 0) return null; return possibleTexts[Math.floor(Math.random() * possibleTexts.length)]; }, [availableTextCategories]);
  const scheduleNextLoop = useCallback((customMode?: boolean) => {
    if (useCustomChords && customMode && customChords.filter(Boolean).length === 4) {
      const idx = (customChordIndex.current + 1) % 4;
      customChordIndex.current = idx;
      const chord = CHORDS.find(c => c.name === customChords[idx]);
      if (!chord) return;
      const text = getRandomFilteredText(chord);
      if (!text) { setNextText("No outlines for selected filters."); return; }
      const interval = barsPerChord * BEAT_INTERVAL_SEC * 4 * 1000;
      const previewTimeout = setTimeout(() => { setNextText(`${chord.name}: ${text}`); }, interval - PREVIEW_OFFSET_MS);
      loopTimeout.current = setTimeout(() => {
        clearTimeout(previewTimeout);
        playChord(chord, text);
        scheduleNextLoop(true);
      }, interval);
      return;
    }
    // ...existing code for random playback...
    if (availableChords.length === 0 || availableTextCategories.length === 0) { setNextText("Change filters to continue."); return; }
    let upcomingChord: Chord, previewText: string | null, attempts = 0;
    do {
      upcomingChord = availableChords[Math.floor(Math.random() * availableChords.length)];
      previewText = getRandomFilteredText(upcomingChord); attempts++;
    } while ( previewText && lastPlayedRef.current && upcomingChord.name === lastPlayedRef.current.chordName && previewText === lastPlayedRef.current.text && attempts < 20 );
    if (!previewText) { setNextText("No outlines for selected filters."); return; }
    const interval = barsPerChord * BEAT_INTERVAL_SEC * 4 * 1000;
    const previewTimeout = setTimeout(() => { setNextText(`${upcomingChord.name}: ${previewText}`); }, interval - PREVIEW_OFFSET_MS);
    loopTimeout.current = setTimeout(() => { clearTimeout(previewTimeout); playChord(upcomingChord, previewText as string); scheduleNextLoop(false); }, interval);
  }, [availableChords, availableTextCategories, barsPerChord, getRandomFilteredText, playChord, useCustomChords, customChords]);
  const startPlayback = () => {
    const context = contextRef.current;
    if (isPlaying || !context) return;
    if (useCustomChords && customChords.filter(Boolean).length === 4) {
      context.resume();
      setIsPlaying(true);
      customChordIndex.current = 0;
      const chord = CHORDS.find(c => c.name === customChords[0]);
      if (!chord) return;
      const text = getRandomFilteredText(chord);
      if (!text) {
        setCustomText("No outlines available for your selection.");
        stopPlayback();
        return;
      }
      playChord(chord, text);
      scheduleNextLoop(true);
      return;
    }
    // ...existing code for random playback...
    if (availableChords.length === 0) { alert("Please select at least one Chord Type."); return; }
    if (availableTextCategories.length === 0) { alert("Please select at least one Outline type."); return; }
    context.resume(); setIsPlaying(true);
    const firstChord = availableChords[Math.floor(Math.random() * availableChords.length)];
    const firstText = getRandomFilteredText(firstChord);
    if (!firstText) { setCustomText("No outlines available for your selection."); stopPlayback(); return; }
    playChord(firstChord, firstText); scheduleNextLoop(false);
  };
  const stopPlayback = () => { /* (Unchanged) */ setIsPlaying(false); if (loopTimeout.current) clearTimeout(loopTimeout.current); stopAllAudio(); contextRef.current?.suspend(); setCurrentChord(null); setCustomText("Select your settings and press play"); setNextText(""); lastPlayedRef.current = null; };

  // Info section state
  const [infoOpen, setInfoOpen] = useState<{ how: boolean; about: boolean; join: boolean; updates: boolean; coming: boolean }>({ how: false, about: false, join: false, updates: false, coming: false });

  // Info texts
  const howToUseText = `Start by choosing how long each chord should last, which chord types you want to hear, and what kinds of sounds you want to explore using the Outline options.\n\nOnce playback begins, the current chord will be shown on screen, along with a randomly selected outlining option (like a triad or Penta) for you to play over it.\n\nGet ready for the upcoming chord — and its outlining suggestion — shown below under Next.`;
  const aboutText = `This is the very first version of a new app I’m developing to help musicians apply many of the techniques and sounds I teach — all within a musical context.\n\nI truly believe this is a fresh and fun way to practice the fundamentals on your instrument, while exploring new sounds and enjoying the process.\nA real win–win–win.\n\nIn the future, many more chord types, keys, drum grooves, and play-along options will be added.\nMost outlining sounds will also be connected to lessons, in case you want more ideas or a deeper understanding of how to use them and how they work.\n\nWe’re at the very beginning of something I’m excited to share — and there’s much more to come.`;
  const joinText = `I’m recording all the audio from my home studio and coding the app with AI.\nIf you’re a musician and want to contribute recordings for future play-along features, or a software developer who’s into creative tools and could help improve the app — I’d love to collaborate.\n\nJust drop me a message via the Contact page on my website or reach out on social media.`;
  const updatesText = `Solo Lab has some new chords!\nI record everything piece by piece, so it takes time—but I’ll keep adding more regularly.\nOutline chords have been edited and a few mistakes fixed.\nA custom chord section has been added.\nOnly a 4-chord loop option is available for now—but this will be expanded soon.`;
  const comingSoonText = `More drum styles and tempos, more chords,\nand the ability to click on a sound to learn more about it—\nwith teaching videos I’m making that explain how to use the sounds you like.`;

  return (
    <>
      <style jsx global>{`
        [data-checked="false"] { opacity: 0.3; transform: scale(0.8); } [data-checked="true"] { opacity: 1; transform: scale(1); }
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        body { margin: 0; font-family: 'Poppins', sans-serif; background-color: #1a1a1d; color: #f0f0f0; }
        @media (max-width: 800px) {
          .mainContent-responsive {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 24px !important;
            padding: 24px 0 !important;
            max-width: 98vw !important;
          }
          .infoCard-responsive, .displayCard-responsive, .controlsCard-responsive {
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            position: static !important;
          }
        }
      `}</style>
      <Head>
        <title>Solo Lab – A Jazz Improv Practice App by Oren Levanon</title>
        <meta name="description" content="Solo Lab is a jazz improvisation app by Oren Levanon. Practice with real audio loops, chord suggestions, and interactive tools." />
      </Head>
      <div style={styles.container}>
        <header style={styles.header}>
            <h1 style={styles.headerTitle}>Solo Lab - v1.1</h1>
            <p style={styles.headerSubtitle}>Take your solos to the next level.</p>
        </header>
        <main className="mainContent-responsive" style={styles.mainContent}>
          {/* === INFO SECTION === */}
          <div className="infoCard-responsive" style={{...styles.infoCard, ...styles.equalHeightCard}}>
            <h2 style={styles.infoTitle}>Info</h2>
            <div style={styles.accordionGroup}>
              <button style={styles.accordionButton} onClick={() => setInfoOpen(o => ({...o, how: !o.how}))}>
                How To Use <span style={styles.accordionArrow}>{infoOpen.how ? '▲' : '▼'}</span>
              </button>
              {infoOpen.how && <div style={styles.accordionContent}><pre style={styles.infoTextBlock}>{howToUseText}</pre></div>}
              <button style={styles.accordionButton} onClick={() => setInfoOpen(o => ({...o, about: !o.about}))}>
                About <span style={styles.accordionArrow}>{infoOpen.about ? '▲' : '▼'}</span>
              </button>
              {infoOpen.about && <div style={styles.accordionContent}><pre style={styles.infoTextBlock}>{aboutText}</pre></div>}
              <button style={styles.accordionButton} onClick={() => setInfoOpen(o => ({...o, join: !o.join}))}>
                Join The Development <span style={styles.accordionArrow}>{infoOpen.join ? '▲' : '▼'}</span>
              </button>
              {infoOpen.join && <div style={styles.accordionContent}><pre style={styles.infoTextBlock}>{joinText}</pre></div>}
              {/* === UPDATES TAB === */}
              <button style={styles.accordionButton} onClick={() => setInfoOpen(o => ({...o, updates: !o.updates}))}>
                Updates <span style={styles.accordionArrow}>{infoOpen.updates ? '▲' : '▼'}</span>
              </button>
              {infoOpen.updates && <div style={styles.accordionContent}><pre style={styles.infoTextBlock}>{updatesText}</pre></div>}
              {/* === COMING SOON TAB === */}
              <button style={styles.accordionButton} onClick={() => setInfoOpen(o => ({...o, coming: !o.coming}))}>
                Coming Soon <span style={styles.accordionArrow}>{infoOpen.coming ? '▲' : '▼'}</span>
              </button>
              {infoOpen.coming && <div style={styles.accordionContent}><pre style={styles.infoTextBlock}>{comingSoonText}</pre></div>}
            </div>
          </div>
          {/* === END INFO SECTION === */}
          {/* Main display and controls */}
          <div className="displayCard-responsive" style={{...styles.card, ...styles.displayCard, ...styles.equalHeightCard}}>
                <div style={styles.chordDisplay}><p style={styles.chordLabel}>Current Chord</p><p style={styles.chordName}>{currentChord?.name || "—"}</p></div>
                <div style={styles.outlineDisplay}><p style={styles.outlineLabel}>Outline</p><p style={styles.outlineText}>{customText}</p></div>
                <div style={styles.nextUpDisplay}><p style={styles.nextUpText}>Next: {nextText || "—"}</p></div>
            </div>
            <div className="controlsCard-responsive" style={{...styles.card, ...styles.controlsCard, ...styles.equalHeightCard}}>
                <h2 style={styles.settingsTitle}>Settings</h2>
                <div style={styles.settingGroup}>
                    <label style={styles.label}>Change Chord Every</label>
                    <CustomSelect<number>
                      options={[ {value: 4, label: "4 Bars"}, {value: 8, label: "8 Bars"}, {value: 16, label: "16 Bars"} ]}
                      value={barsPerChord} onChange={setBarsPerChord}
                    />
                </div>
                 <div style={styles.settingGroup}>
                    <label style={styles.label}>Chord Types</label>
                    <MultiSelectDropdown<ChordType>
                        label="Types" options={CHORD_TYPE_OPTIONS} selected={chordFilters} onChange={setChordFilters}
                    />
                 </div>
                 <div style={styles.settingGroup}>
                    {/* === UPDATED LABEL === */}
                    <label style={styles.label}>Outline</label>
                    {/* === UPDATED DROPDOWN CALL === */}
                    <MultiSelectDropdown<TextCategory>
                        label="Outlines" options={TEXT_TYPE_OPTIONS} selected={textFilters} onChange={setTextFilters}
                        allText="Select All"
                    />
                 </div>
                 <button style={isPlaying ? styles.stopButton : styles.playButton} onClick={() => isPlaying ? stopPlayback() : startPlayback()}>
                    {isPlaying ? "Stop Session" : "Start Session"}
                </button>
                {/* === CUSTOM CHORDS SECTION === */}
                <div style={{ marginTop: 32 }}>
                  <label style={{ fontWeight: 600, color: colors.text, fontSize: '1.1rem', marginBottom: 8, display: 'block' }}>Custom Chords</label>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    {customChords.map((chordName, idx) => (
                      <select
                        key={idx}
                        value={chordName}
                        onChange={e => handleCustomChordChange(idx, e.target.value)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 6,
                          border: '1px solid #444',
                          fontSize: '1rem',
                          background: '#18181b',
                          color: '#fff',
                          minWidth: 120,
                        }}
                      >
                        <option value="">(None)</option>
                        {CHORDS.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    ))}
                    <label style={{ marginLeft: 16, fontSize: '1rem', color: colors.text }}>
                      <input
                        type="checkbox"
                        checked={useCustomChords}
                        onChange={e => setUseCustomChords(e.target.checked)}
                        style={{ marginRight: 6 }}
                      />
                      Use Custom Chord Loop
                    </label>
                  </div>
                </div>
                {/* === END CUSTOM CHORDS SECTION === */}
            </div>
        </main>
        {/* === EMAIL SIGNUP FORM === */}
        <EmailSignupInline />
        {/* === END EMAIL SIGNUP FORM === */}
        <footer style={styles.footer}><p style={styles.infoText}>©
2025 Oren
Levanon / Solo
Lab. All rights reserved.</p></footer>
      </div>
    </>
  );
}

// === STYLES (UPDATED) ===
const colors = { darkBg: '#1a1a1d', cardBg: '#2c2c34', primaryAccent: '#00bcd4', text: '#f0f0f0', textMuted: '#a0a0a0', border: '#444', playGreen: '#4CAF50', stopRed: '#f44336', infoBg: '#23232a', infoAccent: '#00bcd4', infoBorder: '#444' };

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: colors.darkBg, color: colors.text },
  header: { padding: '20px 40px', backgroundColor: colors.cardBg, borderBottom: `1px solid ${colors.border}`, textAlign: 'center' },
  // UPDATED: color changed to white (colors.text)
  headerTitle: { margin: 0, fontSize: '2rem', fontWeight: 700, color: colors.text },
  headerSubtitle: { margin: '4px 0 0', color: colors.textMuted, fontWeight: 400 },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch', // Ensure alignItems is set to stretch
    gap: '32px',
    padding: '40px 0',
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  // Responsive styles for mobile are handled in <style jsx global> above, not here.
  card: { backgroundColor: colors.cardBg, borderRadius: '16px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', border: `1px solid ${colors.border}` },
  displayCard: {
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
    margin: '0 12px',
    backgroundColor: colors.cardBg,
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    border: `1px solid ${colors.border}`,
  },
  controlsCard: {
    flex: '1 1 0',
    position: 'sticky',
    top: '40px',
    backgroundColor: colors.cardBg,
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    border: `1px solid ${colors.border}`,
    color: colors.text,
    display: 'flex',
    flexDirection: 'column',
  },
  chordDisplay: { textAlign: 'center' },
  chordLabel: { margin: 0, color: colors.textMuted, fontSize: '1rem' },
  // UPDATED: color changed to white (colors.text)
  chordName: { margin: '5px 0', fontSize: 'clamp(3rem, 10vw, 5rem)', fontWeight: 700, color: colors.text, lineHeight: 1.1 },
  outlineDisplay: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '20px', textAlign: 'center', minHeight: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  outlineLabel: { margin: 0, color: colors.textMuted, fontSize: '0.9rem', fontWeight: 500 },
  outlineText: { margin: '8px 0 0', fontSize: '1.5rem', fontWeight: 600, color: colors.text, fontStyle: 'italic' },
  nextUpDisplay: { textAlign: 'center', paddingTop: '10px', borderTop: `1px solid ${colors.border}` },
  nextUpText: { margin: 0, color: colors.textMuted, fontStyle: 'italic' },
  // UPDATED: color changed to white (colors.text)
  settingsTitle: { margin: '0 0 25px 0', textAlign: 'center', color: colors.text, fontWeight: 600 },
  settingGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500, color: colors.textMuted },
  playButton: { width: '100%', padding: '15px', fontSize: '1.1rem', fontWeight: 600, color: '#fff', backgroundColor: colors.playGreen, border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease', marginTop: '10px' },
  stopButton: { width: '100%', padding: '15px', fontSize: '1.1rem', fontWeight: 600, color: '#fff', backgroundColor: colors.stopRed, border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s ease', marginTop: '10px' },
  footer: { padding: '20px', textAlign: 'center', backgroundColor: colors.cardBg, borderTop: `1px solid ${colors.border}` },
  infoText: { margin: 0, color: colors.textMuted },
  selectWrapper: { position: 'relative' },
  selectButton: { width: '100%', padding: '12px 15px', backgroundColor: 'rgba(255,255,255,0.05)', border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.text, textAlign: 'left', fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  selectArrow: { transition: 'transform 0.2s ease' },
  selectDropdown: { position: 'absolute', top: '105%', left: 0, right: 0, backgroundColor: '#3c3c44', border: `1px solid ${colors.border}`, borderRadius: '8px', listStyle: 'none', padding: '5px', margin: 0, zIndex: 10, maxHeight: '200px', overflowY: 'auto' },
  selectOption: { padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', transition: 'background-color 0.2s ease', display: 'flex', alignItems: 'center', gap: '10px' },
  checkbox: { width: '18px', height: '18px', border: `2px solid ${colors.primaryAccent}`, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.darkBg, fontWeight: 'bold', transition: 'all 0.2s ease' },
  // === INFO SECTION STYLES ===
  infoCard: {
    flex: '1 1 0',
    backgroundColor: colors.cardBg, // match Settings
    borderRadius: '16px',
    padding: '30px', // match Settings
    border: `1px solid ${colors.border}`,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)', // match Settings
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  infoTitle: {
    margin: '0 0 25px 0',
    textAlign: 'center',
    color: colors.text,
    fontWeight: 600,
    fontSize: '1.3rem',
  },
  accordionGroup: { display: 'flex', flexDirection: 'column', gap: '20px' },
  accordionButton: {
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    color: colors.text,
    fontWeight: 600,
    fontSize: '1rem',
    padding: '12px 15px',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background 0.2s',
    outline: 'none',
  },
  accordionArrow: { marginLeft: 'auto', fontSize: '1.1em', color: colors.textMuted },
  accordionContent: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '12px 15px',
    marginTop: '-2px',
    marginBottom: '6px',
    border: `1px solid ${colors.border}`,
    color: colors.text,
  },
  infoTextBlock: {
    color: colors.text,
    fontSize: '0.98rem',
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    margin: 0,
  },
  // Add equalHeightCard style for flexbox equal height
  equalHeightCard: {
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column',
  },
};

// === INLINE EMAIL SIGNUP FORM COMPONENT ===
function EmailSignupInline() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong.');
        setStatus('error');
      }
    } catch {
      setError('Network error.');
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      width: '100%',
      maxWidth: 700,
      margin: '32px auto 48px', // Move up from footer, add bottom margin
      padding: 0,
      background: 'none',
      border: 'none',
      boxShadow: 'none',
      fontSize: '1rem',
      flexWrap: 'wrap',
    }}>
      <label htmlFor="email-signup-inline" style={{ fontWeight: 600, color: '#fff', marginRight: 8, fontSize: '1.05rem' }}>
        Get notified when a new version drops
      </label>
      <input
        id="email-signup-inline"
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email..."
        style={{
          padding: '10px 14px',
          borderRadius: 6,
          border: '1px solid #444',
          fontSize: '1rem',
          outline: 'none',
          background: '#18181b',
          color: '#fff',
          minWidth: 180,
        }}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          padding: '10px 22px',
          borderRadius: 6,
          border: 'none',
          background: colors.cardBg, // Use gray background like other boxes
          color: '#fff',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          opacity: status === 'loading' ? 0.7 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        Notify Me
      </button>
      {status === 'success' && (
        <span style={{ color: '#4CAF50', fontWeight: 500, marginLeft: 10 }}>Thank you! You’ll be notified.</span>
      )}
      {status === 'error' && (
        <span style={{ color: '#f44336', fontWeight: 500, marginLeft: 10 }}>{error}</span>
      )}
    </form>
  );
}