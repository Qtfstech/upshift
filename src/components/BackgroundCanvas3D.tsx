import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface SectionConfig {
  name: string;
  glowColor: string;
  indicatorColor: string;
}

const SECTION_CONFIGS: Record<string, SectionConfig> = {
  top: {
    name: 'Workplace-Integrated Core',
    glowColor: 'rgba(242, 130, 43, 0.16)',
    indicatorColor: '#F2822B',
  },
  workshops: {
    name: 'Tech Tracks & Labs',
    glowColor: 'rgba(31, 182, 201, 0.16)',
    indicatorColor: '#1FB6C9',
  },
  problem: {
    name: 'Classroom Ceiling Broken',
    glowColor: 'rgba(222, 75, 75, 0.18)',
    indicatorColor: '#DE4B4B',
  },
  solution: {
    name: 'Workplace Nexus Engine',
    glowColor: 'rgba(63, 145, 66, 0.18)',
    indicatorColor: '#3F9142',
  },
  whynow: {
    name: 'Hyderabad 355+ GCC Energy',
    glowColor: 'rgba(242, 130, 43, 0.20)',
    indicatorColor: '#F2822B',
  },
  'why-now': {
    name: 'Hyderabad 355+ GCC Energy',
    glowColor: 'rgba(242, 130, 43, 0.20)',
    indicatorColor: '#F2822B',
  },
  product: {
    name: 'WIL Gyro Ecosystem',
    glowColor: 'rgba(108, 79, 224, 0.18)',
    indicatorColor: '#6C4FE0',
  },
  products: {
    name: 'WIL Gyro Ecosystem',
    glowColor: 'rgba(108, 79, 224, 0.18)',
    indicatorColor: '#6C4FE0',
  },
  domains: {
    name: '12 Deep Tech Sectors Helix',
    glowColor: 'rgba(31, 182, 201, 0.18)',
    indicatorColor: '#1FB6C9',
  },
  investors: {
    name: 'Esteemed Partners Alliance',
    glowColor: 'rgba(108, 79, 224, 0.16)',
    indicatorColor: '#6C4FE0',
  },
  contact: {
    name: 'Career Portal Gateway',
    glowColor: 'rgba(242, 130, 43, 0.22)',
    indicatorColor: '#F2822B',
  },
};

export default function BackgroundCanvas3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>('top');
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 16;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: window.devicePixelRatio < 2,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // Bright lighting setup for clearly visible, vivid 3D models
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 3.2);
    sunLight.position.set(6, 10, 8);
    scene.add(sunLight);

    const warmLight = new THREE.DirectionalLight(0xF2822B, 3.5);
    warmLight.position.set(-6, -4, 6);
    scene.add(warmLight);

    const cyanLight = new THREE.DirectionalLight(0x1FB6C9, 3.0);
    cyanLight.position.set(8, -5, 4);
    scene.add(cyanLight);

    // Section Model Registry: Each has its own completely unique 3D group and update logic!
    const sectionGroups: Record<
      string,
      {
        group: THREE.Group;
        update: (elapsed: number, mouse: { x: number; y: number }) => void;
        dispose: () => void;
        targetX: number;
        targetY: number;
        baseScale: number;
      }
    > = {};

    // =========================================================================
    // 1. HERO (#top): Bright 3D Golden Talent Globe with Orbit Rings & Beacons
    // =========================================================================
    {
      const group = new THREE.Group();

      // Solid faceted golden sphere
      const globeGeo = new THREE.IcosahedronGeometry(3.6, 2);
      const globeMat = new THREE.MeshStandardMaterial({
        color: 0xF2822B,
        metalness: 0.8,
        roughness: 0.25,
        emissive: 0x943E06,
        emissiveIntensity: 0.45,
      });
      const globe = new THREE.Mesh(globeGeo, globeMat);
      group.add(globe);

      // Outer glowing atmosphere grid
      const atmosGeo = new THREE.SphereGeometry(3.85, 24, 24);
      const atmosMat = new THREE.MeshBasicMaterial({
        color: 0xFFE082,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      const atmos = new THREE.Mesh(atmosGeo, atmosMat);
      group.add(atmos);

      // Gold orbital ring with satellite node
      const ringGeo = new THREE.TorusGeometry(5.2, 0.08, 16, 80);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x1FB6C9,
        metalness: 0.9,
        emissive: 0x0C7C8A,
        emissiveIntensity: 0.6,
      });
      const ring1 = new THREE.Mesh(ringGeo, ringMat);
      ring1.rotation.x = Math.PI / 3.2;
      group.add(ring1);

      const ring2 = new THREE.Mesh(ringGeo, ringMat);
      ring2.rotation.x = -Math.PI / 4;
      ring2.rotation.y = Math.PI / 5;
      group.add(ring2);

      // Orbiting satellites
      const satGeo = new THREE.SphereGeometry(0.3, 12, 12);
      const satMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const sat1 = new THREE.Mesh(satGeo, satMat);
      group.add(sat1);

      scene.add(group);
      sectionGroups['top'] = {
        group,
        targetX: window.innerWidth < 1024 ? 0 : 3.8,
        targetY: 0.2,
        baseScale: 1.0,
        update: (elapsed, mouse) => {
          globe.rotation.y += 0.01;
          globe.rotation.x = Math.sin(elapsed * 0.8) * 0.15;
          atmos.rotation.y -= 0.007;
          ring1.rotation.z += 0.012;
          ring2.rotation.z -= 0.015;

          const angle = elapsed * 1.5;
          sat1.position.set(Math.cos(angle) * 5.2, Math.sin(angle) * 2.8, Math.sin(angle) * 3.5);

          group.rotation.x = mouse.y * 0.25;
          group.rotation.y = mouse.x * 0.35;
        },
        dispose: () => {
          globeGeo.dispose();
          globeMat.dispose();
          atmosGeo.dispose();
          atmosMat.dispose();
          ringGeo.dispose();
          ringMat.dispose();
          satGeo.dispose();
          satMat.dispose();
        },
      };
    }

    // =========================================================================
    // 2. WORKSHOPS (#workshops): Bright 3D Hyper-Dimensional Tech Matrix Cube
    // =========================================================================
    {
      const group = new THREE.Group();

      const cubeGeo = new THREE.BoxGeometry(4.0, 4.0, 4.0);
      const cubeMat = new THREE.MeshStandardMaterial({
        color: 0x1FB6C9,
        metalness: 0.85,
        roughness: 0.2,
        emissive: 0x0E5C66,
        emissiveIntensity: 0.5,
      });
      const cube = new THREE.Mesh(cubeGeo, cubeMat);
      group.add(cube);

      // Floating outer wireframe frame
      const frameGeo = new THREE.BoxGeometry(4.6, 4.6, 4.6);
      const frameMat = new THREE.MeshBasicMaterial({
        color: 0xF2822B,
        wireframe: true,
        transparent: true,
        opacity: 0.55,
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      group.add(frame);

      // Four corner energy nodes
      const nodeGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0x6C4FE0 });
      const nodes: THREE.Mesh[] = [];
      const offsets = [
        [2.3, 2.3, 2.3],
        [-2.3, 2.3, 2.3],
        [2.3, -2.3, 2.3],
        [-2.3, -2.3, 2.3],
      ];
      offsets.forEach((pos) => {
        const n = new THREE.Mesh(nodeGeo, nodeMat);
        n.position.set(pos[0], pos[1], pos[2]);
        group.add(n);
        nodes.push(n);
      });

      scene.add(group);
      sectionGroups['workshops'] = {
        group,
        targetX: window.innerWidth < 1024 ? 0 : -3.8,
        targetY: -0.3,
        baseScale: 1.05,
        update: (elapsed, mouse) => {
          cube.rotation.x += 0.012;
          cube.rotation.y += 0.015;
          frame.rotation.x -= 0.015;
          frame.rotation.y += 0.01;
          const s = 1.0 + Math.sin(elapsed * 3) * 0.05;
          frame.scale.set(s, s, s);
          group.rotation.y = mouse.x * 0.4;
          group.rotation.x = mouse.y * 0.3;
        },
        dispose: () => {
          cubeGeo.dispose();
          cubeMat.dispose();
          frameGeo.dispose();
          frameMat.dispose();
          nodeGeo.dispose();
          nodeMat.dispose();
        },
      };
    }

    // =========================================================================
    // 3. THE PROBLEM (#problem): Bright 3D Shattered Concrete & Crimson Obelisk
    // =========================================================================
    {
      const group = new THREE.Group();

      const shardCount = 14;
      const shardMeshes: THREE.Mesh[] = [];
      const shardOrigins: { x: number; y: number; z: number; rotX: number; rotY: number }[] = [];

      for (let i = 0; i < shardCount; i++) {
        const w = 0.8 + Math.random() * 0.9;
        const h = 0.9 + Math.random() * 1.2;
        const d = 0.8 + Math.random() * 0.9;
        const shardGeo = new THREE.BoxGeometry(w, h, d);
        const shardMat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xDE4B4B : 0x475569,
          metalness: 0.8,
          roughness: 0.3,
          emissive: i % 2 === 0 ? 0x8A1818 : 0x1E293B,
          emissiveIntensity: 0.5,
        });
        const mesh = new THREE.Mesh(shardGeo, shardMat);

        const ox = (Math.random() - 0.5) * 3.5;
        const oy = (Math.random() - 0.5) * 3.8;
        const oz = (Math.random() - 0.5) * 2.5;

        mesh.position.set(ox, oy, oz);
        group.add(mesh);
        shardMeshes.push(mesh);
        shardOrigins.push({
          x: ox,
          y: oy,
          z: oz,
          rotX: (Math.random() - 0.5) * 0.03,
          rotY: (Math.random() - 0.5) * 0.03,
        });
      }

      // Warning laser spikes
      const spikeGeo = new THREE.ConeGeometry(0.12, 5.0, 8);
      const spikeMat = new THREE.MeshBasicMaterial({ color: 0xFF1744, transparent: true, opacity: 0.65 });
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.rotation.z = Math.PI / 4;
      group.add(spike);

      scene.add(group);
      sectionGroups['problem'] = {
        group,
        targetX: window.innerWidth < 1024 ? 0 : 3.6,
        targetY: 0.4,
        baseScale: 1.1,
        update: (elapsed, mouse) => {
          shardMeshes.forEach((m, idx) => {
            const orig = shardOrigins[idx];
            m.position.x = orig.x + Math.sin(elapsed * 2 + idx) * 0.4;
            m.position.y = orig.y + Math.cos(elapsed * 1.8 + idx) * 0.4;
            m.rotation.x += orig.rotX;
            m.rotation.y += orig.rotY;
          });
          spike.rotation.y += 0.02;
          group.rotation.x = mouse.y * 0.25;
          group.rotation.y = mouse.x * 0.35;
        },
        dispose: () => {
          shardMeshes.forEach((m) => {
            m.geometry.dispose();
            (m.material as THREE.Material).dispose();
          });
          spikeGeo.dispose();
          spikeMat.dispose();
        },
      };
    }

    // =========================================================================
    // 4. THE SOLUTION (#solution): Bright 3D Workplace Nexus Gear Engine
    // =========================================================================
    {
      const group = new THREE.Group();

      // Dual Interlocking Mechanical Gears
      const createGear = (radius: number, teeth: number, colorHex: number) => {
        const shape = new THREE.Shape();
        const toothDepth = 0.5;
        const totalPoints = teeth * 2;
        for (let i = 0; i < totalPoints; i++) {
          const angle = (i / totalPoints) * Math.PI * 2;
          const r = i % 2 === 0 ? radius + toothDepth : radius;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        }
        shape.closePath();

        // Gear center hole
        const holePath = new THREE.Path();
        holePath.absarc(0, 0, radius * 0.4, 0, Math.PI * 2, true);
        shape.holes.push(holePath);

        const gearGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: true, bevelSegments: 2, bevelSize: 0.1 });
        const gearMat = new THREE.MeshStandardMaterial({
          color: colorHex,
          metalness: 0.9,
          roughness: 0.2,
          emissive: colorHex,
          emissiveIntensity: 0.35,
        });
        return new THREE.Mesh(gearGeo, gearMat);
      };

      const gearGreen = createGear(2.2, 12, 0x3F9142);
      gearGreen.position.set(-1.4, -0.6, 0);
      group.add(gearGreen);

      const gearGold = createGear(1.8, 10, 0xF2822B);
      gearGold.position.set(1.6, 0.8, 0.2);
      group.add(gearGold);

      // Central Quantum Fusion Reactor Core
      const coreGeo = new THREE.OctahedronGeometry(1.2, 1);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.set(0, 0, 0.6);
      group.add(core);

      scene.add(group);
      sectionGroups['solution'] = {
        group,
        targetX: window.innerWidth < 1024 ? 0 : -3.5,
        targetY: -0.2,
        baseScale: 1.0,
        update: (elapsed, mouse) => {
          gearGreen.rotation.z += 0.015;
          gearGold.rotation.z -= 0.018;
          core.rotation.x += 0.03;
          core.rotation.y += 0.04;
          const pulse = 1.0 + Math.sin(elapsed * 5) * 0.12;
          core.scale.set(pulse, pulse, pulse);
          group.rotation.x = mouse.y * 0.25;
          group.rotation.y = mouse.x * 0.35;
        },
        dispose: () => {
          gearGreen.geometry.dispose();
          (gearGreen.material as THREE.Material).dispose();
          gearGold.geometry.dispose();
          (gearGold.material as THREE.Material).dispose();
          coreGeo.dispose();
          coreMat.dispose();
        },
      };
    }

    // =========================================================================
    // 5. WHY NOW (#why-now / #whynow): Bright 3D Hyderabad 355+ GCC Cyber-Cityscape
    // =========================================================================
    {
      const group = new THREE.Group();

      const buildings: THREE.Mesh[] = [];
      const buildingCount = 18;
      const bGeo = new THREE.BoxGeometry(0.8, 1, 0.8);

      for (let i = 0; i < buildingCount; i++) {
        const height = 1.8 + Math.random() * 4.2;
        const bMat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xF2822B : 0x1FB6C9,
          metalness: 0.85,
          roughness: 0.2,
          emissive: i % 2 === 0 ? 0x943E06 : 0x0B525C,
          emissiveIntensity: 0.45,
        });

        const b = new THREE.Mesh(bGeo, bMat);
        const row = Math.floor(i / 6) - 1;
        const col = (i % 6) - 2.5;
        b.scale.set(1, height, 1);
        b.position.set(col * 1.2, height / 2 - 2.5, row * 1.2);
        group.add(b);
        buildings.push(b);
      }

      // Vertical data telemetry beams
      const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 8, 8);
      const beamMat = new THREE.MeshBasicMaterial({ color: 0xFFD54F, transparent: true, opacity: 0.8 });
      const beam1 = new THREE.Mesh(beamGeo, beamMat);
      beam1.position.set(-0.6, 2.0, 0);
      group.add(beam1);

      const beam2 = new THREE.Mesh(beamGeo, beamMat);
      beam2.position.set(1.2, 2.5, -0.6);
      group.add(beam2);

      scene.add(group);
      const updateCity = (elapsed: number, mouse: { x: number; y: number }) => {
        group.rotation.y = elapsed * 0.3 + mouse.x * 0.4;
        group.rotation.x = 0.25 + mouse.y * 0.2;
        beam1.position.y = 2.0 + Math.sin(elapsed * 4) * 0.5;
        beam2.position.y = 2.5 + Math.cos(elapsed * 4) * 0.5;
      };

      const disposeCity = () => {
        bGeo.dispose();
        buildings.forEach((b) => (b.material as THREE.Material).dispose());
        beamGeo.dispose();
        beamMat.dispose();
      };

      sectionGroups['whynow'] = {
        group,
        targetX: 0,
        targetY: 0,
        baseScale: 1.1,
        update: updateCity,
        dispose: disposeCity,
      };
      sectionGroups['why-now'] = sectionGroups['whynow'];
    }

    // =========================================================================
    // 6. PRODUCT (#product / #products): Bright 3D Atomic Gyroscope Ecosystem
    // =========================================================================
    {
      const group = new THREE.Group();

      const createGyroRing = (radius: number, tube: number, color: number) => {
        const geo = new THREE.TorusGeometry(radius, tube, 16, 80);
        const mat = new THREE.MeshStandardMaterial({
          color,
          metalness: 0.9,
          roughness: 0.15,
          emissive: color,
          emissiveIntensity: 0.4,
        });
        return new THREE.Mesh(geo, mat);
      };

      const ringOuter = createGyroRing(4.5, 0.14, 0x6C4FE0);
      group.add(ringOuter);

      const ringMid = createGyroRing(3.4, 0.12, 0xF2822B);
      group.add(ringMid);

      const ringInner = createGyroRing(2.3, 0.1, 0x1FB6C9);
      group.add(ringInner);

      const centerBallGeo = new THREE.SphereGeometry(1.1, 24, 24);
      const centerBallMat = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        metalness: 0.5,
        roughness: 0.1,
        emissive: 0x9370DB,
        emissiveIntensity: 0.8,
      });
      const centerBall = new THREE.Mesh(centerBallGeo, centerBallMat);
      group.add(centerBall);

      scene.add(group);
      const updateGyro = (elapsed: number, mouse: { x: number; y: number }) => {
        ringOuter.rotation.x += 0.015;
        ringOuter.rotation.y += 0.01;
        ringMid.rotation.y += 0.02;
        ringMid.rotation.z -= 0.015;
        ringInner.rotation.z += 0.025;
        ringInner.rotation.x -= 0.02;
        centerBall.rotation.y += 0.03;
        group.rotation.x = mouse.y * 0.3;
        group.rotation.y = mouse.x * 0.35;
      };

      const disposeGyro = () => {
        ringOuter.geometry.dispose();
        (ringOuter.material as THREE.Material).dispose();
        ringMid.geometry.dispose();
        (ringMid.material as THREE.Material).dispose();
        ringInner.geometry.dispose();
        (ringInner.material as THREE.Material).dispose();
        centerBallGeo.dispose();
        centerBallMat.dispose();
      };

      sectionGroups['product'] = {
        group,
        targetX: window.innerWidth < 1024 ? 0 : 3.4,
        targetY: 0.2,
        baseScale: 1.05,
        update: updateGyro,
        dispose: disposeGyro,
      };
      sectionGroups['products'] = sectionGroups['product'];
    }

    // =========================================================================
    // 7. DOMAINS (#domains): Bright 3D Deep-Tech Double Helix DNA Strand
    // =========================================================================
    {
      const group = new THREE.Group();

      const rungCount = 22;
      const rungs: THREE.Mesh[] = [];
      const rungGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.8, 12);
      rungGeo.rotateZ(Math.PI / 2);

      const sphereGeo = new THREE.SphereGeometry(0.2, 12, 12);
      const sphereMat1 = new THREE.MeshBasicMaterial({ color: 0x1FB6C9 });
      const sphereMat2 = new THREE.MeshBasicMaterial({ color: 0x3F9142 });

      for (let i = 0; i < rungCount; i++) {
        const t = (i / rungCount) * Math.PI * 4;
        const y = (i - rungCount / 2) * 0.45;

        const rungMat = new THREE.MeshStandardMaterial({
          color: 0xE2E8F0,
          metalness: 0.8,
          roughness: 0.2,
          emissive: 0x1FB6C9,
          emissiveIntensity: 0.3,
        });
        const rung = new THREE.Mesh(rungGeo, rungMat);
        rung.position.y = y;
        rung.rotation.y = t;
        group.add(rung);
        rungs.push(rung);

        // End spheres
        const s1 = new THREE.Mesh(sphereGeo, sphereMat1);
        s1.position.set(Math.cos(t) * 1.4, y, Math.sin(t) * 1.4);
        group.add(s1);

        const s2 = new THREE.Mesh(sphereGeo, sphereMat2);
        s2.position.set(-Math.cos(t) * 1.4, y, -Math.sin(t) * 1.4);
        group.add(s2);
      }

      scene.add(group);
      sectionGroups['domains'] = {
        group,
        targetX: window.innerWidth < 1024 ? 0 : 3.8,
        targetY: 0,
        baseScale: 1.0,
        update: (elapsed, mouse) => {
          group.rotation.y += 0.02;
          group.rotation.x = Math.sin(elapsed) * 0.15 + mouse.y * 0.2;
        },
        dispose: () => {
          rungGeo.dispose();
          sphereGeo.dispose();
          sphereMat1.dispose();
          sphereMat2.dispose();
          rungs.forEach((r) => (r.material as THREE.Material).dispose());
        },
      };
    }

    // =========================================================================
    // 8. CONTACT (#contact): Bright 3D Futuristic Hex Quantum Portal Gateway
    // =========================================================================
    {
      const group = new THREE.Group();

      const hexRings: THREE.Mesh[] = [];
      for (let i = 0; i < 5; i++) {
        const radius = 2.0 + i * 0.9;
        const ringGeo = new THREE.TorusGeometry(radius, 0.1, 6, 6);
        const ringMat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xF2822B : 0x1FB6C9,
          metalness: 0.9,
          roughness: 0.2,
          emissive: i % 2 === 0 ? 0x943E06 : 0x0B525C,
          emissiveIntensity: 0.5,
        });
        const mesh = new THREE.Mesh(ringGeo, ringMat);
        mesh.position.z = -i * 1.2;
        group.add(mesh);
        hexRings.push(mesh);
      }

      // Gateway Core Beacon
      const beaconGeo = new THREE.IcosahedronGeometry(0.8, 1);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.z = -4.8;
      group.add(beacon);

      scene.add(group);
      sectionGroups['contact'] = {
        group,
        targetX: 0,
        targetY: -0.5,
        baseScale: 1.15,
        update: (elapsed, mouse) => {
          hexRings.forEach((ring, idx) => {
            ring.rotation.z += 0.015 * (idx % 2 === 0 ? 1 : -1);
          });
          beacon.rotation.x += 0.04;
          beacon.rotation.y += 0.05;
          group.rotation.x = mouse.y * 0.3;
          group.rotation.y = mouse.x * 0.35;
        },
        dispose: () => {
          hexRings.forEach((r) => {
            r.geometry.dispose();
            (r.material as THREE.Material).dispose();
          });
          beaconGeo.dispose();
          beaconMat.dispose();
        },
      };
    }

    // Scroll and Active Section Detection
    let activeSec = 'top';
    const sectionIds = Object.keys(SECTION_CONFIGS);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollY / docHeight : 0;
      setScrollProgress(Math.round(progress * 100) / 100);

      const middleY = window.scrollY + window.innerHeight * 0.45;
      let currentSec = 'top';

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const elTop = rect.top + window.scrollY;
          const elBottom = elTop + rect.height;
          if (middleY >= elTop && middleY <= elBottom) {
            currentSec = id;
            break;
          }
        }
      }
      activeSec = currentSec;
      setActiveSection((prev) => (prev === currentSec ? prev : currentSec));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Mouse & Touch Tracking
    const targetMouse = { x: 0, y: 0 };
    const currentMouse = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouse.x = (e.touches[0].clientX / window.innerWidth - 0.5) * 1.5;
        targetMouse.y = -(e.touches[0].clientY / window.innerHeight - 0.5) * 1.5;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Master Animation Loop: Smooth transitions between section 3D models!
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const currentPositions: Record<string, { x: number; y: number; scale: number; opacity: number }> = {};
    Object.keys(sectionGroups).forEach((k) => {
      currentPositions[k] = { x: 0, y: 0, scale: 0.001, opacity: 0 };
    });

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (document.hidden) return;
      const elapsed = clock.getElapsedTime();

      // Lerp mouse
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.06;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.06;

      // Update and cross-fade each section group
      Object.entries(sectionGroups).forEach(([secKey, obj]) => {
        const isActive = activeSec === secKey || (secKey === 'whynow' && activeSec === 'why-now') || (secKey === 'product' && activeSec === 'products');
        const pos = currentPositions[secKey];

        const targetScale = isActive ? obj.baseScale : 0.001;
        const targetOpacity = isActive ? 1.0 : 0.0;

        pos.scale += (targetScale - pos.scale) * 0.06;
        pos.opacity += (targetOpacity - pos.opacity) * 0.08;
        pos.x += (obj.targetX - pos.x) * 0.05;
        pos.y += (obj.targetY - pos.y) * 0.05;

        obj.group.visible = pos.scale > 0.02;
        obj.group.scale.set(pos.scale, pos.scale, pos.scale);
        obj.group.position.x = pos.x + currentMouse.x * 0.6;
        obj.group.position.y = pos.y + currentMouse.y * 0.6;

        if (obj.group.visible) {
          obj.update(elapsed, currentMouse);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      Object.values(sectionGroups).forEach((obj) => obj.dispose());
      ambientLight.dispose();
      sunLight.dispose();
      warmLight.dispose();
      cyanLight.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const activeConfig = SECTION_CONFIGS[activeSection] || SECTION_CONFIGS.top;

  return (
    <>
      {/* 3D WebGL Multi-Model Canvas */}
      <div
        ref={containerRef}
        className="focus-blur fixed inset-0 pointer-events-none -z-10 overflow-hidden"
        style={{ opacity: 0.95 }}
      />

      {/* Dynamic Ambient Aura that morphs with each distinct section */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 transition-colors duration-1000 ease-out"
        style={{
          background: `radial-gradient(ellipse 65% 55% at 50% 40%, ${activeConfig.glowColor} 0%, transparent 85%)`,
        }}
      />

      {/* Floating Webflow Indicator */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-ink/10 shadow-lift pointer-events-auto transition-all duration-300 hover:border-sun/40">
        <span
          className="h-2 w-2 rounded-full animate-pulse"
          style={{ backgroundColor: activeConfig.indicatorColor }}
        />
        <span className="text-[11px] font-mono font-bold text-ink tracking-tight uppercase">
          {activeConfig.name}
        </span>
        <span className="text-[10px] font-mono text-ink-muted/80 pl-1 border-l border-ink/10">
          {Math.round(scrollProgress * 100)}%
        </span>
      </div>
    </>
  );
}
