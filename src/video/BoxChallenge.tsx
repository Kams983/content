import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {TIMED_SCENES} from '../data/scenes';
import {THEME} from '../data/theme';
import {World} from './World';
import {Caption} from './Caption';

export const BoxChallenge: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = TIMED_SCENES.find((item) => frame >= item.start && frame < item.end) ?? TIMED_SCENES[TIMED_SCENES.length - 1];
  const sceneProgress = (frame - scene.start) / (scene.end - scene.start);
  const endFade = interpolate(frame, [888, 899], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const isEndCard = scene.phase === 'end';

  return (
    <AbsoluteFill style={{backgroundColor: THEME.background, overflow: 'hidden'}}>
      <ThreeCanvas
        width={1080}
        height={1920}
        dpr={1}
        camera={{position: [0, 3.8, 8.5], fov: 50, near: 0.1, far: 100}}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: 'high-performance',
        }}
        onCreated={({gl}) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
        shadows
      >
        <World frame={frame} scene={scene} progress={sceneProgress} />
      </ThreeCanvas>
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 42%, transparent 36%, rgba(3,6,16,.5) 100%), url("data:image/svg+xml,%3Csvg viewBox=%270 0 180 180%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.92%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%27.2%27/%3E%3C/svg%3E")',
        opacity: 0.17,
        mixBlendMode: 'soft-light',
      }} />
      {!isEndCard && <Caption frame={frame} scene={scene} progress={sceneProgress} />}
      {isEndCard && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: THEME.text, fontFamily: 'Inter, Arial, Helvetica, sans-serif', fontSize: 74, lineHeight: 1.08,
          fontWeight: 900, letterSpacing: -2, textAlign: 'center', padding: '0 90px 350px',
          opacity: endFade, textShadow: '0 8px 36px rgba(0,0,0,.8)',
        }}>
          Would you<br /><span style={{color: THEME.accent}}>survive?</span>
        </div>
      )}
    </AbsoluteFill>
  );
};
