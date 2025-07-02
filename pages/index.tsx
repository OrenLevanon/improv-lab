import React, { useState, useRef, useEffect } from 'react';

// === CHORD CONFIGURATION ===
interface Chord {
  name: string;
  audioFile: string;
  bassFile?: string;
  texts: string[];
}

const CHORDS: Chord[] = [
  {
    name: "Cmaj7",
    audioFile: "gtr_cmaj7.wav",
    bassFile: "bass_c.wav",
    texts: [
      "D major triad", "E major triad", "G major triad", "A minor triad", "B minor triad",
      "D sus2", "E sus2", "G sus2", "D sus4", "E sus4", "G sus4", "B sus4",
      "Dmaj add2", "Dmaj add4", "Emin add2", "Emin add4", "Gmaj add2", "Gmaj add4",
      "Amin add2", "Amin add4", "Bmin add4",
      "Cmaj pentatonic", "Dmaj pentatonic", "Emin pentatonic", "Gmaj pentatonic", "Bmin pentatonic",
      "Cmaj / Dmaj", "Bmin / Cmaj", "Cmaj / Bbmaj"
    ]
  },
  {
    name: "G7Alt",
    audioFile: "gtr_galt.wav",
    bassFile: "bass_g.wav",
    texts: [
      "Ab minor triad", "Ab sus2", "Ab sus4",
      "Bb minor triad", "Bb susb2", "Bb sus4",
      "Db major triad", "Db sus2", "Db sus#4",
      "Eb major triad", "Eb sus2", "Eb sus4",
      "Abmin add4", "Abmin add2", "Bbmin addb2", "Bbmin add4",
      "Db add2", "Db add#4", "Eb add2", "Eb add4",
      "Abmin6 pentatonic", "Dbmaj pentatonic",
      "Abmin / Bbmin", "Dbmaj / Ebmaj"
    ]
  },
  {
    name: "G7b9",
    audioFile: "gtr_g7b9.wav",
    bassFile: "bass_g.wav",
    texts: [
      "Bb major triad", "Bb minor triad", "Bb minor & major triads",
      "Bbmin6", "Bbmaj6", "Bbaddb2", "Bbadd#4",
      "Bb7b9 pentatonic",
      "Dbmaj", "Dbmin", "Db minor & major",
      "Dbmin6", "Dbmaj6", "Dbaddb2", "Dbadd#4",
      "Db7b9 pentatonic",
      "Emaj", "Emin", "E minor & major",
      "Emin6", "Emaj6", "Eaddb2", "Eadd#4",
      "E7b9 pentatonic",
      "Triad pairs: Gmaj / Dbmaj", "Gmaj / Dbmin", "Gmaj / Bbmin", "Emaj / Bbmin"
    ]
  },
  {
    name: "Cmin7",
    audioFile: "gtr_cmin7.wav",
    bassFile: "bass_c.wav",
    texts: [
      "D minor triad", "Eb major triad", "F major triad", "G minor triad", "Bb major triad",
      "Dmin susb2", "Eb sus2", "Fsus2", "Fsus4", "Gsus2", "Gsus4", "Dsus4", "Ebsus4", "Gsus4", "Bbsus4",
      "Dmin addb2", "Dmin add4", "Ebmaj sus add2", "Ebmaj sus add4", "Fmaj add2", "Fmaj add4", "Gmin add2", "Gmin add4",
      "Bbmaj add4", "Bbmaj add2",
      "Cmin pentatonic", "Dmin pentatonic", "Gmin pentatonic",
      "Cmin / Dmin", "Dmin / Ebmaj", "Ebmaj / Fmaj"
    ]
  }
];

const BEAT_INTERVAL_SEC = 60 / 135;
const PREVIEW_OFFSET_MS = BEAT_INTERVAL_SEC * 8 * 1000; // 2 bars before

export default function Home() {
  const [currentChord, setCurrentChord] = useState<Chord | null>(null);
  const [customText, setCustomText] = useState<string>("Press play to start");
  const [nextText, setNextText] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [barsPerChord, setBarsPerChord] = useState<number>(4);

  const contextRef = useRef<AudioContext | null>(null);
  const bufferRefs = useRef<Record<string, AudioBuffer>>({});
  const currentSources = useRef<AudioBufferSourceNode[]>([]);
  const loopTimeout = useRef<NodeJS.Timeout | null>(null);
  const previewTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initAudio = async () => {
      const context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      contextRef.current = context;

      const loadBuffer = async (filename: string): Promise<AudioBuffer> => {
        const response = await fetch(`/sounds/${filename}`);
        const arrayBuffer = await response.arrayBuffer();
        return await context.decodeAudioData(arrayBuffer);
      };

      const allFiles = new Set<string>();
      CHORDS.forEach(chord => {
        allFiles.add(chord.audioFile);
        if (chord.bassFile) allFiles.add(chord.bassFile);
      });
      allFiles.add("drumgroove_135.wav");

      for (const file of allFiles) {
        bufferRefs.current[file] = await loadBuffer(file);
      }
    };

    initAudio();
  }, []);

  const stopAllAudio = () => {
    currentSources.current.forEach(src => src.stop());
    currentSources.current = [];
  };

  const getIntervalMs = () => barsPerChord * BEAT_INTERVAL_SEC * 4 * 1000;

  const scheduleNextLoop = () => {
    const upcoming = CHORDS[Math.floor(Math.random() * CHORDS.length)];
    const previewText = getRandomText(upcoming.texts);
    setNextText(`${upcoming.name}: ${previewText}`);

    const interval = getIntervalMs();

    previewTimeout.current = setTimeout(() => {
      // placeholder
    }, interval - PREVIEW_OFFSET_MS);

    loopTimeout.current = setTimeout(() => {
      playChord(upcoming, previewText);
      scheduleNextLoop();
    }, interval);
  };

  const playChord = (chord: Chord, text: string) => {
    if (!contextRef.current) return;
    stopAllAudio();

    const context = contextRef.current;
    const sources: AudioBufferSourceNode[] = [];

    const createAndPlay = (file: string) => {
      const src = context.createBufferSource();
      src.buffer = bufferRefs.current[file];
      src.loop = true;
      src.connect(context.destination);
      src.start();
      sources.push(src);
    };

    createAndPlay("drumgroove_135.wav");
    createAndPlay(chord.audioFile);
    if (chord.bassFile) createAndPlay(chord.bassFile);

    currentSources.current = sources;
    setCurrentChord(chord);
    setCustomText(text);
    setNextText("...");
  };

  const startPlayback = () => {
    if (!contextRef.current || isPlaying) return;
    contextRef.current.resume();
    setIsPlaying(true);

    const firstChord = CHORDS[Math.floor(Math.random() * CHORDS.length)];
    const firstText = getRandomText(firstChord.texts);
    setNextText(`${firstChord.name}: ${firstText}`);
    playChord(firstChord, firstText);
    scheduleNextLoop();
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    if (loopTimeout.current) clearTimeout(loopTimeout.current);
    if (previewTimeout.current) clearTimeout(previewTimeout.current);
    stopAllAudio();
    setCurrentChord(null);
    setCustomText("Press play to start");
    setNextText("");
  };

  const togglePlay = () => {
    // FIX: Replaced the ternary operator with an if/else statement
    // to resolve the 'no-unused-expressions' ESLint error.
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const getRandomText = (texts: string[]) => {
    return texts[Math.floor(Math.random() * texts.length)];
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}><h1>Improv Lab</h1></div>
      <div style={styles.card}>
        <div style={styles.chordSection}>
          <h2>Chord:</h2>
          <p style={styles.chord}>{currentChord?.name || "-"}</p>
        </div>
        <p style={styles.playText}><strong>Outline:</strong> <strong>{customText}</strong></p>
        <h3 style={styles.next}>Coming up next: <span>{nextText || "-"}</span></h3>
        <label style={{ marginBottom: '10px' }}>
          Change chord every:  
          <select value={barsPerChord} onChange={(e) => setBarsPerChord(Number(e.target.value))}>
            <option value={4}>4 Bars</option>
            <option value={8}>8 Bars</option>
            <option value={16}>16 Bars</option>
          </select>
        </label>
        <br />
        <button style={styles.button} onClick={togglePlay}>
          {isPlaying ? "⏸️ Stop" : "▶️ Play"}
        </button>
      </div>
      <p style={styles.infoText}>
        Improv Lab is a tool developed by Oren Levanon with the help of AI.<br />
        It is made for people to expand their sound vocabulary<br />
        and have a good time practicing some basics. In other words, eat your veggies and enjoy it.
      </p>
      <div style={styles.footer}>
        <small>© Oren Levanon</small>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'Courier New, monospace',
    textAlign: 'center' as const,
    backgroundColor: '#f4f4f4',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    alignItems: 'center' as const,
    color: '#333'
  },
  header: {
    backgroundColor: '#000',
    color: '#f4f4f4',
    padding: '10px',
    width: '100%',
    fontSize: '1.5em',
    textAlign: 'center' as const
  },
  card: {
    backgroundColor: '#fff',
    border: '2px solid #999',
    borderRadius: '8px',
    padding: '40px',
    margin: '40px auto',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    maxWidth: '600px'
  },
  chordSection: {
    padding: '10px',
    marginBottom: '10px'
  },
  chord: {
    color: '#d6336c',
    fontWeight: 'bold',
    fontSize: '2em',
    margin: 0
  },
  playText: {
    fontSize: '1.5em',
    backgroundColor: '#eee',
    padding: '15px',
    margin: '25px 0',
    fontStyle: 'italic',
    fontWeight: 'bold'
  },
  next: {
    fontSize: '1em',
    color: '#555',
    marginBottom: '20px'
  },
  button: {
    marginTop: '20px',
    padding: '12px 24px',
    fontSize: '1rem',
    backgroundColor: '#d6336c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  infoText: {
    marginTop: '2em',
    lineHeight: '1.6',
    color: '#666',
    textAlign: 'center' as const
  },
  footer: {
    padding: '10px',
    backgroundColor: '#000',
    color: '#f4f4f4',
    width: '100%',
    textAlign: 'center' as const
  }
};