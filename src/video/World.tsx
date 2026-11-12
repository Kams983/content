import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {THEME} from '../data/theme';
import {TIMED_SCENES, type Scene} from '../data/scenes';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const ease = (value: number) => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

type CameraPose = {position: THREE.Vector3; target: THREE.Vector3};
const cameraKeys: Record<string, CameraPose> = {
  hero: {position: new THREE.Vector3(0, 3.2, 8.4), target: new THREE.Vector3(0, 1.5, 0)},
  host: {position: new THREE.Vector3(2.1, 3.15, 7.3), target: new THREE.Vector3(0.65, 1.55, -0.1)},
  wall: {position: new THREE.Vector3(-2.2, 2.8, 6.4), target: new THREE.Vector3(0, 1.35, 0)},
  jordan: {position: new THREE.Vector3(-1.25, 2.9, 5.3), target: new THREE.Vector3(-0.75, 1.2, 0)},
  maya: {position: new THREE.Vector3(1.25, 2.9, 5.3), target: new THREE.Vector3(0.75, 1.2, 0)},
  exit: {position: new THREE.Vector3(2.6, 3, 7.1), target: new THREE.Vector3(0.7, 1.3, 0)},
  orbit: {position: new THREE.Vector3(-1.1, 3.35, 7.1), target: new THREE.Vector3(0, 1.35, 0)},
  end: {position: new THREE.Vector3(0, 3.2, 8.4), target: new THREE.Vector3(0, 1.5, 0)},
};

const cloth: Record<string, string> = {Marcus: '#384c83', Jordan: '#f08c56', Maya: '#42a9a0', Ethan: '#b76fce'};
const hair: Record<string, string> = {Marcus: '#24222c', Jordan: '#35291f', Maya: '#24202a', Ethan: '#302535'};
const SKIN = THEME.skin;

const Character: React.FC<{
  name: string; position: [number, number, number]; frame: number; visible: boolean;
  expression?: 'calm' | 'strain' | 'celebrate' | 'scream'; lean?: number; scale?: number;
}> = ({name, position, frame, visible, expression = 'calm', lean = 0, scale = 1}) => {
  const phase = frame * 0.09 + position[0] * 2;
  const bob = Math.sin(phase) * 0.035 + Math.sin(frame * 0.035 + position[0]) * 0.025;
  const headTilt = Math.sin(frame * 0.045 + position[0]) * 0.045;
  const armSwing = Math.sin(phase) * 0.16;
  const entryDelay = name === 'Jordan' ? 8 : name === 'Maya' ? 18 : name === 'Ethan' ? 28 : 0;
  const entry = name === 'Marcus' ? 1 : ease((frame - entryDelay) / 12);
  const entryDirection = position[0] >= 0 ? 1 : -1;
  const accent = cloth[name] ?? '#64748b';
  const hairColor = hair[name] ?? '#28232d';
  if (!visible) return null;

  return (
    <group
      position={[position[0] + entryDirection * 0.9 * (1 - entry), position[1] + bob + 0.2 * (1 - entry), position[2]]}
      scale={scale * entry}
      rotation={[0, lean * 0.08, lean]}
    >
      <mesh position={[0, 0.99, 0]} castShadow>
        <capsuleGeometry args={[0.38, 0.55, 6, 18]} />
        <meshStandardMaterial color={accent} roughness={0.78} flatShading />
      </mesh>
      <mesh position={[0, 1.63, 0]} castShadow rotation={[0, 0, headTilt]}>
        <sphereGeometry args={[0.3, 20, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.88} flatShading />
      </mesh>
      <mesh position={[0, 1.82, -0.015]} rotation={[0.1, 0, headTilt]} castShadow>
        <sphereGeometry args={[0.305, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
        <meshStandardMaterial color={hairColor} roughness={0.95} flatShading />
      </mesh>
      {[-0.105, 0.105].map((x) => (
        <mesh key={x} position={[x, 1.65, 0.267]}>
          <sphereGeometry args={[0.027, 8, 8]} />
          <meshBasicMaterial color="#11131b" />
        </mesh>
      ))}
      <mesh position={[0, 1.55, 0.284]}>
        <sphereGeometry args={[0.018, 8, 8]} />
        <meshBasicMaterial color={expression === 'strain' ? THEME.red : '#463d3a'} />
      </mesh>
      {expression === 'scream' && (
        <mesh position={[0, 1.54, 0.285]} scale={[0.75, 1.25, 0.65]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshBasicMaterial color="#26151b" />
        </mesh>
      )}
      <mesh position={[-0.22, 1.06, 0]} rotation={[0, 0, -0.13 + armSwing]}>
        <capsuleGeometry args={[0.105, 0.37, 4, 16]} />
        <meshStandardMaterial color={accent} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[-0.36, 0.76, 0.01]} rotation={[0, 0, -0.12 - armSwing * 0.5]}>
        <capsuleGeometry args={[0.085, 0.32, 4, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0.22, 1.06, 0]} rotation={[0, 0, 0.13 - armSwing]}>
        <capsuleGeometry args={[0.105, 0.37, 4, 16]} />
        <meshStandardMaterial color={accent} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0.36, 0.76, 0.01]} rotation={[0, 0, 0.12 + armSwing * 0.5]}>
        <capsuleGeometry args={[0.085, 0.32, 4, 16]} />
        <meshStandardMaterial color={SKIN} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[-0.15, 0.36, 0]} rotation={[0, 0, -0.035]}>
        <capsuleGeometry args={[0.13, 0.38, 4, 16]} />
        <meshStandardMaterial color="#202b46" roughness={0.88} flatShading />
      </mesh>
      <mesh position={[0.15, 0.36, 0]} rotation={[0, 0, 0.035]}>
        <capsuleGeometry args={[0.13, 0.38, 4, 16]} />
        <meshStandardMaterial color="#202b46" roughness={0.88} flatShading />
      </mesh>
      <mesh position={[-0.16, 0.055, 0.04]} castShadow>
        <boxGeometry args={[0.3, 0.11, 0.43]} />
        <meshStandardMaterial color="#151923" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0.16, 0.055, 0.04]} castShadow>
        <boxGeometry args={[0.3, 0.11, 0.43]} />
        <meshStandardMaterial color="#151923" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.015, 0]}>
        <circleGeometry args={[0.47, 20]} />
        <meshBasicMaterial color="#00030a" transparent opacity={0.42} depthWrite={false} />
      </mesh>
      {expression === 'celebrate' && (
        <mesh position={[0, 2.07, 0]} rotation={[0, 0, Math.sin(frame * 0.3) * 0.15]}>
          <torusGeometry args={[0.37, 0.035, 8, 24]} />
          <meshBasicMaterial color={THEME.accent} />
        </mesh>
      )}
    </group>
  );
};

const Dust: React.FC<{frame: number; count?: number}> = ({frame, count = 84}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  const objects = useMemo(() => Array.from({length: count}, (_, i) => ({
    x: Math.sin(i * 127.1) * 3.9,
    y: 0.3 + ((i * 37) % 100) / 34,
    z: -3 + ((i * 19) % 80) / 13,
    size: 0.012 + (i % 5) * 0.004,
    phase: i * 0.71,
  })), [count]);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    objects.forEach((particle, i) => {
      dummy.position.set(particle.x + Math.sin(frame * 0.018 + particle.phase) * 0.11, particle.y + Math.sin(frame * 0.03 + particle.phase) * 0.08, particle.z);
      dummy.scale.setScalar(particle.size);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [frame, objects]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial color="#b4c6de" transparent opacity={0.42} />
    </instancedMesh>
  );
};

const Confetti: React.FC<{frame: number; visible: boolean}> = ({frame, visible}) => {
  if (!visible) return null;
  const t = Math.max(0, frame - 840) / 30;
  return (
    <group>
      {Array.from({length: 90}, (_, i) => {
        const x = Math.sin(i * 12.9898) * (1.1 + (i % 5) * 0.2);
        const z = Math.cos(i * 7.23) * 1.4;
        const y = 4.2 - ((t * (1.1 + (i % 7) * 0.09) + (i * 0.17) % 4.6) % 5.2);
        const color = ['#ffb454', '#f05b78', '#58d7c3', '#f4e978', '#8eb8ff'][i % 5];
        return (
          <mesh key={i} position={[x, y, z]} rotation={[t + i, t * 1.7 + i, i * 0.3]}>
            <boxGeometry args={[0.07, 0.12, 0.025]} />
            <meshBasicMaterial color={color} />
          </mesh>
        );
      })}
    </group>
  );
};

const Box: React.FC<{width: number; phase: string}> = ({width, phase}) => {
  const height = 3.35;
  const depth = 2.5;
  const red = phase === 'red' || phase === 'shrink' || phase === 'tapout' || phase === 'final';
  const color = red ? THEME.red : THEME.cool;
  return (
    <group position={[0, height / 2, 0]}>
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshBasicMaterial color={color} transparent opacity={0.045} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial color={color} transparent opacity={phase === 'freeze' ? 0.7 : 0.8} />
      </lineSegments>
      <pointLight position={[0, 0.7, 0]} color={color} intensity={0.45} distance={5} />
    </group>
  );
};

const CameraRig: React.FC<{frame: number; scene: Scene; progress: number}> = ({frame, scene, progress}) => {
  const {camera} = useThree();
  const from = cameraKeys[scene.camera] ?? cameraKeys.hero;
  const sceneIndex = TIMED_SCENES.findIndex((item) => item.id === scene.id);
  const previousScene = TIMED_SCENES[Math.max(0, sceneIndex - 1)];
  const previous = cameraKeys[previousScene?.camera] ?? cameraKeys.hero;
  const transition = ease((frame - scene.start) / 10);
  const push = scene.phase === 'hook' ? 0.48 * ease(Math.min(progress * 1.8, 1)) : 0;
  const drift = Math.sin(frame * 0.071) * 0.018;
  const orbit = scene.camera === 'orbit' ? Math.sin(progress * Math.PI) * 0.48 : 0;
  const position = previous.position.clone().lerp(from.position, transition);
  position.z -= push;
  position.x += orbit + drift;
  position.y += Math.sin(frame * 0.043) * 0.012;
  const target = previous.target.clone().lerp(from.target, transition);
  camera.position.copy(position);
  camera.lookAt(target.x, target.y, target.z);
  if (camera instanceof THREE.PerspectiveCamera) camera.fov = 50;
  camera.updateProjectionMatrix();
  return null;
};

export const World: React.FC<{frame: number; scene: Scene; progress: number}> = ({frame, scene, progress}) => {
  const phase = scene.phase;
  if (phase === 'end') return <color attach="background" args={['#000000']} />;
  const contraction = phase === 'final' ? ease((frame - 450) / 105) : phase === 'shrink' || phase === 'tapout' ? ease((frame - 150) / 300) : phase === 'freeze' || phase === 'twist' || phase === 'winner' || phase === 'payoff' ? 1 : 0;
  const width = 5.1 - contraction * 2.35;
  const exitProgress = phase === 'tapout' ? ease((frame - 420) / 27) : 0;
  const revealGlow = phase === 'winner' || phase === 'payoff';

  return (
    <>
      <CameraRig frame={frame} scene={scene} progress={progress} />
      <color attach="background" args={[THEME.background]} />
      <fog attach="fog" args={[THEME.background, 8, 23]} />
      <ambientLight intensity={0.75} color="#c0c9df" />
      <directionalLight position={[-4, 8, 5]} intensity={0.75} color="#fff0d9" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[3, 4, -4]} intensity={0.52} color={revealGlow ? THEME.accent : '#647ca8'} />
      {revealGlow && <pointLight position={[-2, 3.8, 0]} color={THEME.accent} intensity={0.55} distance={8} />}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#141b2e" roughness={0.34} metalness={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.045, -2.2]}>
        <planeGeometry args={[2.8, 14]} />
        <meshBasicMaterial color="#344766" transparent opacity={0.2} />
      </mesh>
      {[-5, -3.2, -1.4, 1.4, 3.2, 5].map((x) => (
        <mesh key={x} position={[x, 0.015, -3.4]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.025, 8]} />
          <meshBasicMaterial color={THEME.accent} transparent opacity={0.45} />
        </mesh>
      ))}
      <Box width={width} phase={phase} />
      <mesh position={[0, 1.2, -2]} scale={[3.8, 2.2, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={phase === 'red' ? THEME.red : THEME.accent} transparent opacity={0.055} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <Character name="Jordan" position={[-0.8 - contraction * 0.18, 0, 0.15]} frame={frame} visible={true} expression={phase === 'payoff' ? 'scream' : revealGlow ? 'celebrate' : 'calm'} lean={phase === 'payoff' ? -Math.sin(frame * 0.7) * 0.35 : 0} />
      <Character name="Maya" position={[0.82 + contraction * 0.18, 0, -0.08]} frame={frame} visible={phase !== 'tapout' && frame < 690} expression={phase === 'final' ? 'strain' : 'calm'} lean={phase === 'final' ? Math.sin(frame * 0.11) * 0.12 : 0} />
      <Character name="Ethan" position={[0.15, 0, 0.75 + exitProgress * 2]} frame={frame} visible={frame < 420 || (phase === 'tapout' && frame < 440)} />
      <Character name="Marcus" position={[1.85, 0, -1.65]} frame={frame} visible={phase !== 'payoff'} scale={0.94} />
      <Dust frame={frame} />
      <Confetti frame={frame} visible={phase === 'payoff'} />
      {(phase === 'red' || phase === 'shrink' || phase === 'tapout' || phase === 'final') && (
        <pointLight position={[0, 3.5, 0]} color={THEME.red} intensity={0.45} distance={8} />
      )}
    </>
  );
};
