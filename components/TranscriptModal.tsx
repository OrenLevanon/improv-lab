import React, { useEffect, useRef } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  playedChords: string[];
  outlineChoices: string[];
};

export default function TranscriptModal({ open, onClose, playedChords, outlineChoices }: Props) {
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const isSyncing = useRef(false);

  // scroll to bottom when opened or when lists change
  useEffect(() => {
    if (!open) return;
    const rAF = requestAnimationFrame(() => {
      if (leftRef.current) leftRef.current.scrollTop = leftRef.current.scrollHeight;
      if (rightRef.current) rightRef.current.scrollTop = rightRef.current.scrollHeight;
    });
    return () => cancelAnimationFrame(rAF);
  }, [open, playedChords.length, outlineChoices.length]);

  // synchronize vertical scroll: only the right column shows a scrollbar and drives the left
  useEffect(() => {
    const left = leftRef.current;
    const right = rightRef.current;
    if (!left || !right) return;

    const syncFromRight = () => {
      if (isSyncing.current) return;
      isSyncing.current = true;
      const ratio = right.scrollTop / Math.max(1, right.scrollHeight - right.clientHeight);
      left.scrollTop = Math.round(ratio * Math.max(0, left.scrollHeight - left.clientHeight));
      setTimeout(() => { isSyncing.current = false; }, 0);
    };

    right.addEventListener('scroll', syncFromRight);
    return () => {
      right.removeEventListener('scroll', syncFromRight);
    };
  }, [leftRef, rightRef, open]);

  if (!open) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={dialogStyle} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div style={headerStyle}>
          <h3 style={{ margin: 0 }}>Session Transcript</h3>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Close">✕</button>
        </div>
        <div style={columnsWrapper}>
          <div style={columnStyle}>
            <div style={{ ...columnInner, ...leftInnerOverrides }} ref={leftRef}>
              {playedChords.length === 0 ? (
                <div style={emptyTextStyle}>No chords played yet.</div>
              ) : (
                playedChords.map((c, i) => (
                  <div key={i} style={rowStyle}>{c}</div>
                ))
              )}
            </div>
            <div style={columnLabel}>Chords</div>
          </div>

          <div style={columnStyle}>
            <div style={columnInner} ref={rightRef}>
              {outlineChoices.length === 0 ? (
                <div style={emptyTextStyle}>No outlines chosen yet.</div>
              ) : (
                outlineChoices.map((o, i) => (
                  <div key={i} style={rowStyle}>{o}</div>
                ))
              )}
            </div>
            <div style={columnLabel}>Outlines</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- styles ---
const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};

const dialogStyle: React.CSSProperties = {
  width: '90%', maxWidth: 900, background: '#0f1720', color: '#fff', borderRadius: 12, padding: 16, boxSizing: 'border-box', boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
};

const headerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 };
const closeButtonStyle: React.CSSProperties = { background: 'transparent', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' };

const columnsWrapper: React.CSSProperties = { display: 'flex', gap: 12 };
const columnStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column' };
// Left column will not show a separate scrollbar; the right column drives scrolling.
const columnInner: React.CSSProperties = { background: '#071018', border: '1px solid #233040', borderRadius: 8, padding: 12, height: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 };
const leftInnerOverrides: React.CSSProperties = { overflowY: 'hidden' };
const columnLabel: React.CSSProperties = { marginTop: 8, color: '#9fb0c6', fontSize: 13, textAlign: 'center' };
const rowStyle: React.CSSProperties = { padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.02)', fontSize: 14 };
const emptyTextStyle: React.CSSProperties = { color: '#6b7b86', fontStyle: 'italic' };
