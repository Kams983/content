import React from 'react';
import {Composition} from 'remotion';
import {BoxChallenge} from './video/BoxChallenge';
import {DURATION_IN_FRAMES, FPS} from './data/scenes';

export const Root: React.FC = () => (
  <Composition
    id="BoxChallenge"
    component={BoxChallenge}
    durationInFrames={DURATION_IN_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
  />
);

