import React from 'react';
import {interpolate} from 'remotion';
import type {Scene} from '../data/scenes';
import {THEME} from '../data/theme';

const emphasis = new Set(['$10,000!', 'catch…', 'smaller.', 'ONE', 'MONEY!', 'Actually…', 'longest.', 'WON', 'survive?']);

export const Caption: React.FC<{frame: number; scene: Scene; progress: number}> = ({frame, scene, progress}) => {
  if (!scene.text) return null;
  const words = scene.text.split(' ');
  const activeWord = Math.min(words.length - 1, Math.floor(progress * (words.length + 1)));
  const pop = interpolate(progress, [0, 0.12, 1], [0.82, 1, 1], {extrapolateRight: 'clamp'});
  const jitter = scene.phase === 'red' && frame < scene.start + 9 ? Math.sin(frame * 4.1) * 2 : 0;
  const fontSize = scene.id === 'hook' || scene.id === 'final-call' ? 63 : 70;
  const speakerColor = scene.speaker === 'Jordan' ? '#f08c56' : scene.speaker === 'Maya' ? '#42a9a0' : '#9eb6ff';

  return (
    <div style={{
      position: 'absolute', top: 210, left: 76, right: 205, zIndex: 5,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      transform: `translateY(${jitter}px) scale(${pop})`,
      fontFamily: 'Inter, Arial, Helvetica, sans-serif', textAlign: 'center',
    }}>
      {scene.speaker && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
          padding: '7px 16px 7px 10px', borderRadius: 999,
          background: 'rgba(7,11,20,.88)', border: '1px solid rgba(255,255,255,.2)',
          boxShadow: '0 5px 18px rgba(0,0,0,.4)',
        }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%', background: speakerColor,
            boxShadow: `0 0 12px ${speakerColor}`,
          }} />
          <span style={{
            color: THEME.text, fontSize: 23, fontWeight: 850, letterSpacing: 2.2, lineHeight: 1,
            textTransform: 'uppercase',
          }}>
            {scene.speaker}
          </span>
        </div>
      )}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 16, rowGap: 4,
        maxWidth: 800, color: THEME.text, fontSize, lineHeight: 1.08, fontWeight: 950,
        letterSpacing: -2, textShadow: '0 4px 0 rgba(0,0,0,.72), 0 9px 26px rgba(0,0,0,.8)',
      }}>
        {words.map((word, index) => {
          const highlight = emphasis.has(word) || index === activeWord;
          return (
            <span key={`${word}-${index}`} style={{
              color: highlight ? THEME.accent : THEME.text,
              opacity: index < activeWord - 3 ? 0.76 : 1,
              WebkitTextStroke: '1px rgba(11,16,32,.3)',
            }}>{word}</span>
          );
        })}
      </div>
    </div>
  );
};
