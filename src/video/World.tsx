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
  host: {position: new THREE.Vector3(3.35, 3.1, 6.7), target: new THREE.Vector3(2.75, 1.35, -0.7)},
  wall: {position: new THREE.Vector3(-2.2, 2.8, 6.4), target: new THREE.Vector3(0, 1.35, 0)},
  jordan: {position: new THREE.Vector3(-1.25, 2.9, 5.3), target: new THREE.Vector3(-0.75, 1.2, 0)},
  maya: {position: new THREE.Vector3(1.25, 2.9, 5.3), target: new THREE.Vector3(0.75, 1.2, 0)},
  exit: {position: new THREE.Vector3(2.6, 3, 7.1), target: new THREE.Vector3(0.7, 1.3, 0)},
  orbit: {position: new THREE.Vector3(-1.1, 3.35, 7.1), target: new THREE.Vector3(0, 1.35, 0)},
  end: {position: new THREE.Vector3(0, 3.2, 8.4), target: new THREE.Vector3(0, 1.5, 0)},
};

const cloth: Record<string, string> = {Marcus: '#384c83', Jordan: '#f08c56', Maya: '#42a9a0', Ethan: '#b76fce'};
const hair: Record<string, string> = {Marcus: '#24222c', Jordan: '#35291f', Maya: '#24202a', Ethan: '#302535'};
const trousers: Record<string, string> = {Marcus: '#20283b', Jordan: '#293148', Maya: '#25323d', Ethan: '#31273b'};
const SKIN = THEME.skin;
const torsoProfile = [
  new THREE.Vector2(0.14, 0),
  new THREE.Vector2(0.23, 0.12),
  new THREE.Vector2(0.25, 0.36),
  new THREE.Vector2(0.36, 0.68),
  new THREE.Vector2(0.3, 0.79),
  new THREE.Vector2(0.13, 0.86),
  new THREE.Vector2(0.12, 0.95),
];

const Character: React.FC<{
  name: string; position: [number, number, number]; frame: number; visible: boolean;
  expression?: 'calm' | 'strain' | 'celebrate' | 'scream' | 'react' | 'brace';
  lean?: number; scale?: number; walkProgress?: number;
}> = ({name, position, frame, visible, expression = 'calm', lean = 0, scale = 1, walkProgress = 0}) => {
  const phase = walkProgress * Math.PI * 2;
  const bob = Math.sin(frame * 0.075 + position[0]) * 0.025 + Math.sin(frame * 0.035 + position[0]) * 0.018;
  const headTilt = Math.sin(frame * 0.045 + position[0]) * 0.025;
  const entryDelay = name === 'Jordan' ? 8 : name === 'Maya' ? 18 : name === 'Ethan' ? 28 : 0;
  const entry = name === 'Marcus' ? 1 : ease((frame - entryDelay) / 12);
  const entryDirection = position[0] >= 0 ? 1 : -1;
  const accent = cloth[name] ?? '#64748b';
  const hairColor = hair[name] ?? '#28232d';
  const pantsColor = trousers[name] ?? '#293148';
  const armRaise = expression === 'celebrate' || expression === 'scream' ? 1.95 : expression === 'react' ? 0.85 : expression === 'brace' ? -0.75 : expression === 'strain' ? -0.45 : 0;
  const limbSwing = Math.sin(phase) * Math.min(walkProgress > 0 ? 0.45 : 0, 0.45);
  const eyeColor = '#171a22';
  if (!visible) return null;

  return (
    <group
      position={[position[0] + entryDirection * 0.9 * (1 - entry), position[1] + bob + 0.2 * (1 - entry), position[2]]}
      scale={scale * entry}
      rotation={[0, lean * 0.08, lean]}
    >
      <mesh position={[0, 0.51, 0]} castShadow>
        <latheGeometry args={[torsoProfile, 18]} />
        <meshStandardMaterial color={accent} roughness={0.84} flatShading />
      </mesh>
      <mesh position={[0, 0.62, 0.02]}>
        <boxGeometry args={[0.43, 0.11, 0.39]} />
        <meshStandardMaterial color={pantsColor} roughness={0.92} flatShading />
      </mesh>
      <mesh position={[0, 1.39, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.19, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.88} flatShading />
      </mesh>
      <mesh position={[0, 1.71, 0]} castShadow rotation={[0, 0, headTilt]}>
        <sphereGeometry args={[0.275, 24, 20]} />
        <meshStandardMaterial color={SKIN} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 1.86, -0.018]} rotation={[0.08, 0, headTilt]} castShadow>
        <sphereGeometry args={[0.282, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.43]} />
        <meshStandardMaterial color={hairColor} roughness={0.95} flatShading />
      </mesh>
      {name === 'Maya' && (
        <mesh position={[0, 1.69, -0.16]} castShadow>
          <sphereGeometry args={[0.29, 16, 12]} />
          <meshStandardMaterial color={hairColor} roughness={0.92} flatShading />
        </mesh>
      )}
      {[-1, 1].map((side) => (
        <mesh key={`ear-${side}`} position={[side * 0.268, 1.69, 0]} castShadow>
          <sphereGeometry args={[0.065, 10, 10]} />
          <meshStandardMaterial color={SKIN} roughness={0.9} flatShading />
        </mesh>
      ))}
      {[-0.095, 0.095].map((x) => (
        <React.Fragment key={`eye-${x}`}>
          <mesh position={[x, 1.725, 0.247]}>
            <sphereGeometry args={[0.041, 10, 10]} />
            <meshBasicMaterial color="#f0e9df" />
          </mesh>
          <mesh position={[x, 1.725, 0.28]}>
            <sphereGeometry args={[0.021, 8, 8]} />
            <meshBasicMaterial color={eyeColor} />
          </mesh>
          <mesh position={[x, 1.79, 0.246]} rotation={[0, 0, x < 0 ? 0.12 : -0.12]}>
            <boxGeometry args={[0.095, 0.022, 0.024]} />
            <meshStandardMaterial color={hairColor} roughness={0.95} flatShading />
          </mesh>
        </React.Fragment>
      ))}
      <mesh position={[0, 1.675, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.045, 0.105, 8]} />
        <meshStandardMaterial color={SKIN} roughness={0.85} flatShading />
      </mesh>
      {expression === 'scream' ? (
        <mesh position={[0, 1.59, 0.258]} scale={[0.75, 1.25, 0.65]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshBasicMaterial color="#26151b" />
        </mesh>
      ) : (
        <mesh position={[0, 1.585, 0.258]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[expression === 'celebrate' ? 0.045 : 0.032, 0.009, 6, 12, Math.PI]} />
          <meshBasicMaterial color="#443b3a" />
        </mesh>
      )}
      {expression === 'strain' && (
        <mesh position={[0, 1.56, 0.23]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color={THEME.red} />
        </mesh>
      )}
      {[-1, 1].map((side) => (
        <group
          key={`arm-${side}`}
          position={[side * 0.29, 1.27, 0]}
          rotation={[0, 0, side * armRaise + side * limbSwing + Math.sin(frame * 0.04 + side) * 0.025]}
        >
          <mesh position={[side * 0.025, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.105, 0.25, 6, 16]} />
            <meshStandardMaterial color={accent} roughness={0.86} flatShading />
          </mesh>
          <mesh position={[side * 0.04, -0.36, 0]}>
            <sphereGeometry args={[0.102, 10, 10]} />
            <meshStandardMaterial color={accent} roughness={0.9} flatShading />
          </mesh>
          <group position={[side * 0.04, -0.37, 0]} rotation={[0, 0, side * -0.1 + limbSwing * 0.6]}>
            <mesh position={[side * 0.018, -0.17, 0]} castShadow>
              <capsuleGeometry args={[0.082, 0.22, 6, 14]} />
              <meshStandardMaterial color={accent} roughness={0.86} flatShading />
            </mesh>
            <mesh position={[side * 0.025, -0.34, 0.018]}>
              <sphereGeometry args={[0.085, 10, 10]} />
              <meshStandardMaterial color={SKIN} roughness={0.91} flatShading />
            </mesh>
          </group>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={`leg-${side}`} position={[side * 0.14, 0.57, 0]} rotation={[0, 0, side * limbSwing]}>
          <mesh position={[0, -0.17, 0]} castShadow>
            <capsuleGeometry args={[0.13, 0.31, 6, 16]} />
            <meshStandardMaterial color={pantsColor} roughness={0.92} flatShading />
          </mesh>
          <mesh position={[0, -0.39, 0]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshStandardMaterial color={pantsColor} roughness={0.92} flatShading />
          </mesh>
          <mesh position={[0, -0.43, 0.035]} castShadow>
            <capsuleGeometry args={[0.105, 0.29, 6, 14]} />
            <meshStandardMaterial color={pantsColor} roughness={0.92} flatShading />
          </mesh>
          <mesh position={[0, -0.56, 0.09]} castShadow>
            <boxGeometry args={[0.25, 0.12, 0.39]} />
            <meshStandardMaterial color="#171b24" roughness={0.88} flatShading />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.012, 0]}>
        <circleGeometry args={[0.39, 20]} />
        <meshBasicMaterial color="#00030a" transparent opacity={0.36} depthWrite={false} />
      </mesh>
      {expression === 'celebrate' && (
        <mesh position={[0, 2.08, 0]} rotation={[0, 0, Math.sin(frame * 0.3) * 0.15]}>
          <torusGeometry args={[0.34, 0.026, 8, 24]} />
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

const Box: React.FC<{width: number; phase: string; frame: number}> = ({width, phase, frame}) => {
  const height = 3.35;
  const depth = 2.5;
  const red = phase === 'red' || phase === 'shrink' || phase === 'tapout' || phase === 'final';
  const glow = red ? THEME.red : THEME.cool;
  const metal = '#506078';
  const doorWidth = Math.min(0.9, width * 0.34);
  const doorAngle = phase === 'tapout' ? -ease((frame - 420) / 12) * Math.PI * 0.43 : 0;
  const panels = [
    {position: [0, 0, -depth / 2] as [number, number, number], rotation: [0, Math.PI, 0] as [number, number, number], size: [width, height] as [number, number]},
    {position: [-width / 2 + (width - doorWidth) / 4, 0, depth / 2] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], size: [(width - doorWidth) / 2, height] as [number, number]},
    {position: [width / 2 - (width - doorWidth) / 4, 0, depth / 2] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], size: [(width - doorWidth) / 2, height] as [number, number]},
    {position: [-width / 2, 0, 0] as [number, number, number], rotation: [0, Math.PI / 2, 0] as [number, number, number], size: [depth, height] as [number, number]},
    {position: [width / 2, 0, 0] as [number, number, number], rotation: [0, -Math.PI / 2, 0] as [number, number, number], size: [depth, height] as [number, number]},
  ];
  const rail = (position: [number, number, number], size: [number, number, number], color = metal) => (
    <mesh key={`${position.join(',')}-${size.join(',')}`} position={position} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={0.72} roughness={0.28} />
    </mesh>
  );
  return (
    <group position={[0, height / 2, 0]}>
      {panels.map((panel, index) => (
        <mesh key={`glass-${index}`} position={panel.position} rotation={panel.rotation}>
          <planeGeometry args={panel.size} />
          <meshPhysicalMaterial color="#9ab9d4" metalness={0.12} roughness={0.18} transparent opacity={index === 0 ? 0.12 : 0.075} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
      <group position={[-doorWidth / 2, 0, depth / 2]} rotation={[0, doorAngle, 0]}>
        <mesh position={[doorWidth / 2, 0, 0]} castShadow>
          <planeGeometry args={[doorWidth, height]} />
          <meshPhysicalMaterial color="#b5d1e5" metalness={0.18} roughness={0.14} transparent opacity={0.09} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {rail([doorWidth / 2, 0, 0.025], [0.045, height, 0.05], '#8296ac')}
        {rail([doorWidth / 2, height / 2, 0.025], [doorWidth, 0.05, 0.05], '#8296ac')}
        {rail([doorWidth / 2, -height / 2, 0.025], [doorWidth, 0.05, 0.05], '#8296ac')}
        {rail([doorWidth - 0.13, 0, 0.065], [0.045, 0.22, 0.04], THEME.accent)}
      </group>
      {[-1, 1].flatMap((side) => [-1, 1].map((front) => rail([side * width / 2, 0, front * depth / 2], [0.075, height, 0.075])))}
      {[-1, 1].flatMap((level) => [-1, 1].map((front) => rail([0, level * height / 2, front * depth / 2], [width + 0.08, 0.07, 0.075])))}
      {[-1, 1].flatMap((level) => [-1, 1].map((side) => rail([side * width / 2, level * height / 2, 0], [0.075, 0.07, depth + 0.08])))}
      {rail([0, -height / 2 + 0.035, 0], [width - 0.08, 0.07, depth - 0.08], '#293549')}
      {rail([0, height / 2 + 0.012, 0], [width - 0.04, 0.035, 0.035], glow)}
      <pointLight position={[0, 0.3, 0]} color={glow} intensity={0.32} distance={4.5} />
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
  const contraction = phase === 'final'
    ? 0.55 + ease((frame - 450) / 105) * 0.45
    : phase === 'shrink' || phase === 'tapout'
      ? ease((frame - 150) / 300) * 0.55
      : phase === 'freeze' || phase === 'twist' || phase === 'winner' || phase === 'payoff' ? 1 : 0;
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
        <meshStandardMaterial color="#171c28" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.045, -2.2]}>
        <planeGeometry args={[2.5, 14]} />
        <meshStandardMaterial color="#263344" roughness={0.32} metalness={0.3} />
      </mesh>
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 0.014, -2.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.018, 14]} />
          <meshBasicMaterial color={THEME.accent} transparent opacity={0.42} />
        </mesh>
      ))}
      {Array.from({length: 12}, (_, i) => (
        <mesh key={`mark-${i}`} position={[(i % 2 ? 1 : -1) * 1.4, 0.012, -5 + Math.floor(i / 2) * 0.95]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.36, 0.045]} />
          <meshBasicMaterial color="#b9844c" transparent opacity={0.52} />
        </mesh>
      ))}
      <Box width={width} phase={phase} frame={frame} />
      <mesh position={[0, 1.2, -2]} scale={[3.8, 2.2, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={phase === 'red' || phase === 'final' ? THEME.red : THEME.accent} transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <Character
        name="Jordan"
        position={[-0.8 - contraction * 0.18, 0, 0.15]}
        frame={frame}
        visible
        expression={phase === 'payoff' ? 'scream' : phase === 'winner' ? 'celebrate' : scene.id === 'protest' ? 'react' : 'calm'}
        lean={phase === 'payoff' ? -Math.sin(frame * 0.7) * 0.22 : 0}
      />
      <Character
        name="Maya"
        position={[0.82 + contraction * 0.18, 0, -0.08]}
        frame={frame}
        visible={phase !== 'tapout' && frame < 690}
        expression={scene.id === 'money' ? 'brace' : phase === 'final' ? 'strain' : 'calm'}
        lean={phase === 'final' ? Math.sin(frame * 0.11) * 0.12 : 0}
      />
      <Character
        name="Ethan"
        position={[0.15, 0, 0.75 + exitProgress * 2]}
        frame={frame}
        visible={frame < 420 || (phase === 'tapout' && frame < 440)}
        walkProgress={exitProgress}
        lean={exitProgress * -0.12}
      />
      <Character name="Marcus" position={[2.75, 0, -1.65]} frame={frame} visible scale={0.94} />
      <Dust frame={frame} />
      <Confetti frame={frame} visible={phase === 'payoff'} />
      {(phase === 'red' || phase === 'shrink' || phase === 'tapout' || phase === 'final') && (
        <pointLight position={[0, 3.5, 0]} color={THEME.red} intensity={0.45} distance={8} />
      )}
    </>
  );
};
