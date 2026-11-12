import sceneData from './scenes.json';
import {SCRIPT, type ScriptKey} from './script';

export type AudioCueType = 'impact' | 'bell' | 'riser' | 'glitch' | 'confetti' | 'swell';
export type ScenePhase = 'hook' | 'red' | 'shrink' | 'tapout' | 'final' | 'freeze' | 'twist' | 'winner' | 'payoff' | 'end';
export type CameraKey = 'hero' | 'host' | 'wall' | 'jordan' | 'maya' | 'exit' | 'orbit' | 'end';

type SceneDefinition = {
  id: string;
  start: number;
  end: number;
  script?: ScriptKey;
  speaker?: string;
  phase: ScenePhase;
  camera: CameraKey;
  audio: {at: number; type: AudioCueType}[];
};

export const FPS = sceneData.fps;
export const DURATION_IN_FRAMES = sceneData.durationInFrames;
export const SCENES = sceneData.scenes as SceneDefinition[];

export const getSceneText = (scene: SceneDefinition) => scene.script ? SCRIPT[scene.script] : '';

export type Scene = SceneDefinition & {text: string};
export const TIMED_SCENES: Scene[] = SCENES.map((scene) => ({...scene, text: getSceneText(scene)}));

