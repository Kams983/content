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

const wardrobe: Record<string, {shirt: string; pants: string; hair: string; skin: string}> = {
  Marcus: {shirt: '#29384f', pants: '#202630', hair: '#242128', skin: '#bd8b69'},
  Jordan: {shirt: '#b9633f', pants: '#313642', hair: '#342820', skin: '#d3a07e'},
  Maya: {shirt: '#247d79', pants: '#2a3038', hair: '#29222a', skin: '#a96f51'},
  Ethan: {shirt: '#654879', pants: '#32303a', hair: '#30272a', skin: '#c18e6b'},
};
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
  expression?: 'calm' | 'strain' | 'celebrate' | 'scream' | 'react' | 'brace' | 'present';
  lean?: number; scale?: number; walkProgress?: number;
}> = ({name, position, frame, visible, expression = 'calm', lean = 0, scale = 1, walkProgress = 0}) => {
  const phase = walkProgress * Math.PI * 2;
  const bob = Math.sin(frame * 0.075 + position[0]) * 0.025 + Math.sin(frame * 0.035 + position[0]) * 0.018;
  const headTilt = Math.sin(frame * 0.045 + position[0]) * 0.025;
  const entryDelay = name === 'Jordan' ? 2 : name === 'Maya' ? 10 : name === 'Ethan' ? 18 : 0;
  const entry = name === 'Marcus' ? 1 : ease((frame - entryDelay) / 26);
  const entryDirection = position[0] >= 0 ? 1 : -1;
  const person = wardrobe[name] ?? wardrobe.Jordan;
  const accent = person.shirt;
  const hairColor = person.hair;
  const pantsColor = person.pants;
  const skinColor = person.skin;
  const skinMaterial = <meshPhysicalMaterial color={skinColor} roughness={0.76} clearcoat={0.08} clearcoatRoughness={0.8} />;
  const armRaise = expression === 'celebrate' || expression === 'scream' ? 2.45 : expression === 'react' ? 1.35 : expression === 'brace' ? -0.15 : expression === 'strain' ? -0.35 : 0;
  const limbSwing = Math.sin(phase) * 0.42;
  const eyeColor = '#171a22';
  if (!visible) return null;

  return (
    <group
      position={[position[0] + entryDirection * 0.2 * (1 - entry), position[1] + bob + 2.25 * (1 - entry), position[2] + (name === 'Marcus' ? 0 : 2.5 * (1 - entry))]}
      scale={scale * (0.96 + entry * 0.04)}
      rotation={[0, lean * 0.08, lean]}
    >
      <mesh position={[0, 0.51, 0]} castShadow>
        <latheGeometry args={[torsoProfile, 28]} />
        <meshStandardMaterial color={accent} roughness={0.74} />
      </mesh>
      <mesh position={[0, 0.62, 0.02]}>
        <boxGeometry args={[0.43, 0.11, 0.39]} />
        <meshStandardMaterial color={pantsColor} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.64, 0.225]}>
        <boxGeometry args={[0.32, 0.035, 0.018]} />
        <meshStandardMaterial color="#c0a26e" metalness={0.52} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.94, 0.31]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[0.13, 0.2, 0.035]} />
        <meshStandardMaterial color="#d7d0c3" roughness={0.72} />
      </mesh>
      <mesh position={[0, 1.11, 0.32]}>
        <sphereGeometry args={[0.027, 10, 8]} />
        <meshStandardMaterial color="#d9c8a9" metalness={0.35} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.39, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.19, 12]} />
        {skinMaterial}
      </mesh>
      <mesh position={[0, 1.68, 0]} scale={[0.84, 1, 0.88]} castShadow rotation={[0, 0, headTilt]}>
        <sphereGeometry args={[0.275, 32, 24]} />
        {skinMaterial}
      </mesh>
      <mesh position={[0, 1.83, -0.016]} scale={[0.84, 1, 0.88]} rotation={[0.08, 0, headTilt]} castShadow>
        <sphereGeometry args={[0.282, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.43]} />
        <meshPhysicalMaterial color={hairColor} roughness={0.56} clearcoat={0.16} clearcoatRoughness={0.62} />
      </mesh>
      {name === 'Maya' && (
        <mesh position={[0, 1.65, -0.13]} scale={[0.91, 1.12, 0.9]} castShadow>
          <sphereGeometry args={[0.28, 24, 18]} />
          <meshPhysicalMaterial color={hairColor} roughness={0.62} clearcoat={0.1} />
        </mesh>
      )}
      {[-1, 1].map((side) => (
        <mesh key={`ear-${side}`} position={[side * 0.226, 1.67, 0.005]} castShadow>
          <sphereGeometry args={[0.05, 14, 12]} />
          {skinMaterial}
        </mesh>
      ))}
      {[-0.083, 0.083].map((x) => (
        <React.Fragment key={`eye-${x}`}>
          <mesh position={[x, 1.709, 0.237]}>
            <sphereGeometry args={[0.047, 14, 12]} />
            <meshStandardMaterial color="#e7ddd0" roughness={0.48} />
          </mesh>
          <mesh position={[x + 0.006, 1.709, 0.277]}>
            <sphereGeometry args={[0.022, 12, 10]} />
            <meshStandardMaterial color={eyeColor} roughness={0.35} />
          </mesh>
          <mesh position={[x, 1.778, 0.234]} rotation={[0, 0, x < 0 ? 0.12 : -0.12]}>
            <capsuleGeometry args={[0.014, 0.065, 4, 10]} />
            <meshStandardMaterial color={hairColor} roughness={0.76} />
          </mesh>
        </React.Fragment>
      ))}
      <mesh position={[0, 1.66, 0.256]}>
        <sphereGeometry args={[0.038, 12, 10]} />
        {skinMaterial}
      </mesh>
      <mesh position={[0, 1.55, 0.229]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.036, 0.009, 8, 14, Math.PI]} />
        <meshStandardMaterial color="#503b35" roughness={0.62} />
      </mesh>
      {expression === 'scream' ? (
        <mesh position={[0, 1.56, 0.246]} scale={[0.78, 1.55, 0.62]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#301c20" roughness={0.8} />
        </mesh>
      ) : (
        <mesh position={[0, 1.585, 0.258]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[expression === 'celebrate' ? 0.045 : 0.032, 0.008, 8, 14, Math.PI]} />
          <meshStandardMaterial color="#503b35" roughness={0.62} />
        </mesh>
      )}
      {[-1, 1].map((side) => (
        <group
          key={`arm-${side}`}
          position={[side * 0.29, 1.27, 0]}
          rotation={[0, 0, expression === 'present'
            ? (side === 1 ? 2.35 : 0.04) + side * limbSwing
            : side * armRaise + side * limbSwing + Math.sin(frame * 0.04 + side) * 0.025]}
        >
          <mesh position={[side * 0.025, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.105, 0.25, 6, 16]} />
            <meshStandardMaterial color={accent} roughness={0.78} />
          </mesh>
          <mesh position={[side * 0.04, -0.36, 0]}>
            <sphereGeometry args={[0.102, 10, 10]} />
            <meshStandardMaterial color={accent} roughness={0.8} />
          </mesh>
          <group position={[side * 0.04, -0.37, 0]} rotation={[0, 0, side * -0.1 + limbSwing * 0.6]}>
            <mesh position={[side * 0.018, -0.17, 0]} castShadow>
              <capsuleGeometry args={[0.082, 0.22, 6, 14]} />
              <meshStandardMaterial color={accent} roughness={0.78} />
            </mesh>
            <mesh position={[side * 0.025, -0.34, 0.018]}>
              <sphereGeometry args={[0.085, 10, 10]} />
              {skinMaterial}
            </mesh>
          </group>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={`leg-${side}`} position={[side * 0.14, 0.57, 0]} rotation={[0, 0, side * limbSwing]}>
          <mesh position={[0, -0.17, 0]} castShadow>
            <capsuleGeometry args={[0.13, 0.31, 6, 16]} />
            <meshStandardMaterial color={pantsColor} roughness={0.84} />
          </mesh>
          <mesh position={[0, -0.39, 0]}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshStandardMaterial color={pantsColor} roughness={0.84} />
          </mesh>
          <mesh position={[0, -0.43, 0.035]} castShadow>
            <capsuleGeometry args={[0.105, 0.29, 6, 14]} />
            <meshStandardMaterial color={pantsColor} roughness={0.84} />
          </mesh>
          <mesh position={[0, -0.56, 0.09]} castShadow>
            <boxGeometry args={[0.25, 0.12, 0.39]} />
            <meshStandardMaterial color="#171b24" roughness={0.7} />
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

const SEGMENTS: Record<string, string[]> = {
  '0': ['top', 'upperLeft', 'upperRight', 'lowerLeft', 'lowerRight', 'bottom'],
  '1': ['upperRight', 'lowerRight'],
  '2': ['top', 'upperRight', 'middle', 'lowerLeft', 'bottom'],
  '3': ['top', 'upperRight', 'middle', 'lowerRight', 'bottom'],
};

const DigitalDigit: React.FC<{digit: string}> = ({digit}) => {
  const positions: Record<string, [number, number, number]> = {
    top: [0, 0.12, 0],
    middle: [0, 0, 0],
    bottom: [0, -0.12, 0],
    upperLeft: [-0.06, 0.065, 0],
    upperRight: [0.06, 0.065, 0],
    lowerLeft: [-0.06, -0.065, 0],
    lowerRight: [0.06, -0.065, 0],
  };
  return (
    <group>
      {Object.entries(positions).map(([segment, position]) => {
        const horizontal = segment === 'top' || segment === 'middle' || segment === 'bottom';
        const active = SEGMENTS[digit]?.includes(segment);
        return (
          <mesh key={segment} position={position} rotation={[0, 0, horizontal ? 0 : Math.PI / 2]}>
            <boxGeometry args={[0.105, 0.025, 0.012]} />
            <meshBasicMaterial
              color={active ? THEME.red : '#351c25'}
              transparent={!active}
              opacity={active ? 1 : 0.44}
            />
          </mesh>
        );
      })}
    </group>
  );
};

const ChallengeTimer: React.FC<{frame: number}> = ({frame}) => {
  const digits = frame >= 375 ? '3000' : '0000';
  return (
    <group position={[0, 3.72, -1.15]}>
      <mesh position={[0, 0, -0.055]}>
        <boxGeometry args={[1.18, 0.42, 0.1]} />
        <meshStandardMaterial color="#111720" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <boxGeometry args={[1.08, 0.34, 0.012]} />
        <meshStandardMaterial color="#090c12" roughness={0.46} />
      </mesh>
      {digits.split('').map((digit, index) => (
        <group key={index} position={[(index - 1.5) * 0.21, 0, 0.014]}>
          <DigitalDigit digit={digit} />
        </group>
      ))}
      {[0.055, -0.055].map((y) => (
        <mesh key={y} position={[0, y, 0.025]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshBasicMaterial color={THEME.accent} />
        </mesh>
      ))}
    </group>
  );
};

const StudioRig: React.FC = () => (
  <group>
    <mesh position={[0, 2.5, -7.5]}>
      <planeGeometry args={[18, 8]} />
      <meshStandardMaterial color="#101722" roughness={0.94} />
    </mesh>
    <mesh position={[0, 4.9, -1]} castShadow>
      <boxGeometry args={[9.5, 0.16, 0.16]} />
      <meshStandardMaterial color="#283343" metalness={0.68} roughness={0.4} />
    </mesh>
    {[-4.5, 4.5].map((x) => (
      <group key={x}>
        <mesh position={[x, 2.55, -1.15]} castShadow>
          <boxGeometry args={[0.12, 5, 0.14]} />
          <meshStandardMaterial color="#303a49" metalness={0.66} roughness={0.38} />
        </mesh>
        <mesh position={[x - Math.sign(x) * 0.08, 3.4, -1.05]}>
          <boxGeometry args={[0.035, 0.68, 0.045]} />
          <meshBasicMaterial color={THEME.accent} transparent opacity={0.7} />
        </mesh>
      </group>
    ))}
    {[-2.65, 2.65].map((x) => (
      <group key={x} position={[x, 4.8, 0.2]} rotation={[0.34, 0, x < 0 ? 0.14 : -0.14]}>
        <mesh>
          <boxGeometry args={[1.1, 0.09, 0.58]} />
          <meshStandardMaterial color="#283343" metalness={0.42} roughness={0.36} />
        </mesh>
        <mesh position={[0, -0.055, 0]}>
          <planeGeometry args={[0.86, 0.38]} />
          <meshBasicMaterial color="#fff0d9" transparent opacity={0.75} />
        </mesh>
      </group>
    ))}
  </group>
);

const ControlConsole: React.FC<{frame: number; active: boolean}> = ({frame, active}) => (
  <group position={[3.5, 0, -0.55]} rotation={[0, -0.16, 0]}>
    <mesh position={[0, 0.42, 0]} castShadow>
      <boxGeometry args={[0.62, 0.82, 0.48]} />
      <meshStandardMaterial color="#252e3c" metalness={0.62} roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.86, 0]} rotation={[-0.22, 0, 0]} castShadow>
      <boxGeometry args={[0.72, 0.11, 0.58]} />
      <meshStandardMaterial color="#121922" metalness={0.48} roughness={0.34} />
    </mesh>
    <mesh position={[0, 0.925, 0.015]} rotation={[-0.22, 0, 0]}>
      <planeGeometry args={[0.58, 0.38]} />
      <meshBasicMaterial color="#17282e" />
    </mesh>
    {[-0.19, -0.06, 0.07, 0.2].map((x, index) => (
      <mesh key={x} position={[x, 0.93, 0.12]} rotation={[-0.22, 0, 0]}>
        <cylinderGeometry args={[0.027, 0.032, 0.035, 12]} />
        <meshStandardMaterial
          color={active && index === 1 ? THEME.red : index === 3 ? '#70c99a' : '#c79b61'}
          emissive={active && index === 1 ? THEME.red : '#000000'}
          emissiveIntensity={0.6}
          metalness={0.35}
          roughness={0.34}
        />
      </mesh>
    ))}
    <mesh position={[0.24, 0.93, -0.12]} rotation={[-0.22, 0, 0]}>
      <cylinderGeometry args={[0.045, 0.045, 0.05, 16]} />
      <meshStandardMaterial color="#bb544b" metalness={0.32} roughness={0.4} />
    </mesh>
    <mesh position={[0.24, 0.965 + Math.sin(frame * 0.2) * 0.003, -0.12]}>
      <cylinderGeometry args={[0.022, 0.022, 0.025, 12]} />
      <meshStandardMaterial color="#e2aaa0" roughness={0.4} />
    </mesh>
  </group>
);

const Box: React.FC<{width: number; depth: number; phase: string; frame: number}> = ({width, depth, phase, frame}) => {
  const height = 3.35;
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
      {[-1, 1].flatMap((side) => [0.42, 2.72].map((y) => rail([side * (width / 2 - 0.035), y - height / 2, 0], [0.08, 0.1, depth - 0.16], '#333e4b')))}
      {[-1, 1].flatMap((side) => [-0.62, 0.62].map((z) => (
        <group key={`actuator-${side}-${z}`} position={[side * (width / 2 + 0.13), -height / 2 + 0.22, z]}>
          <mesh castShadow>
            <boxGeometry args={[0.24, 0.24, 0.42]} />
            <meshStandardMaterial color="#273442" metalness={0.76} roughness={0.32} />
          </mesh>
          <mesh position={[-side * 0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.044, 0.044, 0.32, 16]} />
            <meshStandardMaterial color="#9aabb8" metalness={0.82} roughness={0.24} />
          </mesh>
          <mesh position={[side * 0.065, 0.14, 0]}>
            <sphereGeometry args={[0.035, 10, 8]} />
            <meshBasicMaterial color={phase === 'red' || phase === 'shrink' || phase === 'final' ? THEME.red : '#75d9a8'} />
          </mesh>
        </group>
      )))}
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
  const preFinal = phase === 'shrink' || phase === 'tapout'
    ? ease((frame - 150) / 300) * 0.45
    : phase === 'final' || phase === 'freeze' || phase === 'twist' || phase === 'winner' || phase === 'payoff' ? 0.45 : 0;
  const finalProgress = phase === 'final' ? ease((frame - 450) / 105) : phase === 'freeze' || phase === 'twist' || phase === 'winner' || phase === 'payoff' ? 1 : 0;
  const width = 5.1 - preFinal * 0.8 - finalProgress * 2.7;
  const depth = 2.5 - preFinal * 0.4 - finalProgress * 0.95;
  const contestantSpacing = 0.82 - preFinal * 0.08 - finalProgress * 0.42;
  const exitProgress = phase === 'tapout' ? ease((frame - 420) / 27) : 0;
  const jordanEntry = ease((frame - 2) / 26);
  const mayaEntry = ease((frame - 10) / 26);
  const ethanEntry = ease((frame - 18) / 26);
  const revealGlow = phase === 'winner' || phase === 'payoff';

  return (
    <>
      <CameraRig frame={frame} scene={scene} progress={progress} />
      <color attach="background" args={[THEME.background]} />
      <fog attach="fog" args={[THEME.background, 8, 23]} />
      <ambientLight intensity={0.75} color="#c0c9df" />
      <directionalLight position={[-4, 8, 5]} intensity={0.75} color="#fff0d9" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[3, 4, -4]} intensity={0.52} color={revealGlow ? THEME.accent : '#647ca8'} />
      <pointLight position={[-3, 4.4, 1]} color="#9abfff" intensity={0.42} distance={11} />
      <pointLight position={[3.5, 3.7, -1.5]} color={revealGlow ? THEME.accent : '#d4e4ff'} intensity={0.38} distance={9} />
      {revealGlow && <pointLight position={[-2, 3.8, 0]} color={THEME.accent} intensity={0.48} distance={8} />}
      <StudioRig />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.27, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#111720" roughness={0.42} metalness={0.16} />
      </mesh>
      <mesh position={[0, -0.16, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[4.5, 4.58, 0.2, 72]} />
        <meshStandardMaterial color="#202936" roughness={0.35} metalness={0.42} />
      </mesh>
      <mesh position={[0, -0.053, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4.36, 0.025, 8, 72]} />
        <meshStandardMaterial color="#435268" metalness={0.72} roughness={0.3} />
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
      <ChallengeTimer frame={frame} />
      <Box width={width} depth={depth} phase={phase} frame={frame} />
      <mesh position={[0, 1.2, -2]} scale={[3.8, 2.2, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={phase === 'red' || phase === 'final' ? THEME.red : THEME.accent} transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <Character
        name="Jordan"
        position={[-contestantSpacing, 0, 0.15]}
        frame={frame}
        visible
        expression={phase === 'payoff' ? 'scream' : phase === 'winner' ? 'celebrate' : scene.id === 'protest' ? 'react' : scene.id === 'crush' ? 'brace' : 'calm'}
        lean={phase === 'payoff' ? -Math.sin(frame * 0.7) * 0.22 : 0}
        walkProgress={jordanEntry}
      />
      <Character
        name="Maya"
        position={[contestantSpacing, 0, -0.08]}
        frame={frame}
        visible={phase !== 'tapout' && frame < 690}
        expression={scene.id === 'resolve' || scene.id === 'money' ? 'brace' : phase === 'final' ? 'strain' : 'calm'}
        lean={phase === 'final' ? Math.sin(frame * 0.11) * 0.12 : 0}
        walkProgress={mayaEntry}
      />
      <Character
        name="Ethan"
        position={[0.15, 0, 0.75 + exitProgress * 2]}
        frame={frame}
        visible={frame < 420 || (phase === 'tapout' && frame < 440)}
        walkProgress={ethanEntry + exitProgress * 0.5}
        lean={exitProgress * -0.12}
      />
      <Character name="Marcus" position={[2.75, 0, -1.65]} frame={frame} visible scale={0.94} expression={scene.id === 'hook' || scene.id === 'final-call' ? 'present' : 'calm'} />
      <ControlConsole frame={frame} active={phase === 'shrink' || phase === 'final'} />
      <Dust frame={frame} />
      <Confetti frame={frame} visible={phase === 'payoff'} />
      {(phase === 'red' || phase === 'shrink' || phase === 'tapout' || phase === 'final') && (
        <pointLight position={[0, 3.5, 0]} color={THEME.red} intensity={0.45} distance={8} />
      )}
    </>
  );
};
