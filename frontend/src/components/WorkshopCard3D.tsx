import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type WorkshopTrack = 'cybersecurity' | 'robotics' | 'spacetech' | 'embedded' | 'bim' | 'content';

interface WorkshopCard3DProps {
  track: WorkshopTrack;
  accentColor: string;
}

export default function WorkshopCard3D({ track, accentColor }: WorkshopCard3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  // Hover lives in a ref so hovering never tears down and rebuilds the WebGL context.
  const hoveredRef = useRef(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 240;
    const height = 140;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.z = 7.5;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: window.devicePixelRatio < 2,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // Lights for bright, vivid 3D visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(5, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(accentColor === 'sun' ? 0xF2822B : 0x1FB6C9, 2.5);
    dirLight2.position.set(-5, -4, 4);
    scene.add(dirLight2);

    const group = new THREE.Group();
    scene.add(group);

    // Track-specific unique 3D models
    const animObjects: {
      update: (elapsed: number, hovered: boolean) => void;
      dispose: () => void;
    }[] = [];

    if (track === 'cybersecurity') {
      // ----------------------------------------------------
      // CYBERSECURITY: 3D Quantum Vault Padlock & Rotating Holographic Matrix
      // ----------------------------------------------------
      const cyberGroup = new THREE.Group();
      group.add(cyberGroup);

      // 1. Vault Padlock Body (Chamfered high-gloss titanium & gold chassis)
      const bodyGeo = new THREE.BoxGeometry(1.9, 1.7, 0.75);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x181412,
        metalness: 0.9,
        roughness: 0.2,
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.position.y = -0.3;
      cyberGroup.add(bodyMesh);

      // Accent Faceplate Plate (Sun Gold / Amber)
      const faceGeo = new THREE.BoxGeometry(1.6, 1.4, 0.8);
      const faceMat = new THREE.MeshStandardMaterial({
        color: 0xF2822B,
        metalness: 0.8,
        roughness: 0.25,
        emissive: 0x933F05,
        emissiveIntensity: 0.35,
      });
      const faceMesh = new THREE.Mesh(faceGeo, faceMat);
      faceMesh.position.y = -0.3;
      cyberGroup.add(faceMesh);

      // 2. Heavy Titanium Shackle Ring on top
      const shackleGeo = new THREE.TorusGeometry(0.75, 0.16, 20, 48, Math.PI);
      const shackleMat = new THREE.MeshStandardMaterial({
        color: 0xE2E8F0,
        metalness: 0.95,
        roughness: 0.1,
      });
      const shackleMesh = new THREE.Mesh(shackleGeo, shackleMat);
      shackleMesh.position.set(0, 0.55, 0);
      cyberGroup.add(shackleMesh);

      // Left and right shackle docking cylinders
      const dockGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.4, 16);
      const dockMat = new THREE.MeshStandardMaterial({ color: 0xF2822B, metalness: 0.9 });
      const dockL = new THREE.Mesh(dockGeo, dockMat);
      dockL.position.set(-0.75, 0.5, 0);
      cyberGroup.add(dockL);
      const dockR = new THREE.Mesh(dockGeo, dockMat);
      dockR.position.set(0.75, 0.5, 0);
      cyberGroup.add(dockR);

      // 3. Glowing Biometric Scanner Lens in center
      const lensGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.85, 32);
      const lensMat = new THREE.MeshStandardMaterial({
        color: 0x0A0F1D,
        metalness: 0.7,
        roughness: 0.3,
      });
      const lensMesh = new THREE.Mesh(lensGeo, lensMat);
      lensMesh.rotation.x = Math.PI / 2;
      lensMesh.position.y = -0.3;
      cyberGroup.add(lensMesh);

      // Glowing Center Laser Aperture Ring
      const ringApertureGeo = new THREE.TorusGeometry(0.35, 0.04, 16, 32);
      const ringApertureMat = new THREE.MeshBasicMaterial({ color: 0xFFB300 });
      const ringAperture = new THREE.Mesh(ringApertureGeo, ringApertureMat);
      ringAperture.position.set(0, -0.3, 0.43);
      cyberGroup.add(ringAperture);

      // 4. Central Glowing Cryptographic Quantum Prism
      const prismGeo = new THREE.OctahedronGeometry(0.24, 0);
      const prismMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const prism = new THREE.Mesh(prismGeo, prismMat);
      prism.position.set(0, -0.3, 0.44);
      cyberGroup.add(prism);

      // 5. Dual Orbiting Holographic Security Firewall Rings
      const orbitRingGeo1 = new THREE.TorusGeometry(1.85, 0.035, 16, 64);
      const orbitRingMat1 = new THREE.MeshStandardMaterial({
        color: 0xF2822B,
        emissive: 0xF2822B,
        emissiveIntensity: 0.9,
        wireframe: true,
      });
      const orbitRing1 = new THREE.Mesh(orbitRingGeo1, orbitRingMat1);
      cyberGroup.add(orbitRing1);

      const orbitRingGeo2 = new THREE.TorusGeometry(2.1, 0.03, 16, 64);
      const orbitRingMat2 = new THREE.MeshStandardMaterial({
        color: 0x00E5FF,
        emissive: 0x00B4D8,
        emissiveIntensity: 0.8,
        wireframe: true,
      });
      const orbitRing2 = new THREE.Mesh(orbitRingGeo2, orbitRingMat2);
      cyberGroup.add(orbitRing2);

      // 4 Orbiting Security Node Spheres
      const nodeGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0xFFE082 });
      const nodes: THREE.Mesh[] = [];
      for (let i = 0; i < 4; i++) {
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        cyberGroup.add(node);
        nodes.push(node);
      }

      animObjects.push({
        update: (elapsed, hovered) => {
          const speed = hovered ? 2.6 : 1.0;
          cyberGroup.rotation.y = Math.sin(elapsed * 0.8 * speed) * 0.45;
          cyberGroup.rotation.x = Math.cos(elapsed * 0.6 * speed) * 0.15;
          shackleMesh.position.y = 0.55 + (hovered ? 0.14 + Math.sin(elapsed * 5) * 0.03 : 0);

          orbitRing1.rotation.z += 0.025 * speed;
          orbitRing1.rotation.x = Math.PI / 4 + Math.sin(elapsed * 2) * 0.15;
          orbitRing2.rotation.x += 0.02 * speed;
          orbitRing2.rotation.y += 0.03 * speed;

          prism.rotation.y += 0.06 * speed;
          prism.rotation.z += 0.04 * speed;
          const pScale = 1 + Math.sin(elapsed * 4) * 0.12;
          prism.scale.set(pScale, pScale, pScale);

          nodes.forEach((n, idx) => {
            const angle = elapsed * 1.5 * speed + (idx * Math.PI) / 2;
            n.position.set(Math.cos(angle) * 1.85, Math.sin(angle * 0.8) * 0.6 - 0.3, Math.sin(angle) * 1.85);
          });
        },
        dispose: () => {
          bodyGeo.dispose();
          bodyMat.dispose();
          faceGeo.dispose();
          faceMat.dispose();
          shackleGeo.dispose();
          shackleMat.dispose();
          dockGeo.dispose();
          dockMat.dispose();
          lensGeo.dispose();
          lensMat.dispose();
          ringApertureGeo.dispose();
          ringApertureMat.dispose();
          prismGeo.dispose();
          prismMat.dispose();
          orbitRingGeo1.dispose();
          orbitRingMat1.dispose();
          orbitRingGeo2.dispose();
          orbitRingMat2.dispose();
          nodeGeo.dispose();
          nodeMat.dispose();
        },
      });
    } else if (track === 'robotics') {
      // ----------------------------------------------------
      // ROBOTICS: 3D Futuristic Cybernetic AI Robot Head & Neural Visor
      // ----------------------------------------------------
      const botGroup = new THREE.Group();
      group.add(botGroup);

      // 1. Android Cranium Shell (Sleek aerodynamic head)
      const craniumGeo = new THREE.SphereGeometry(1.15, 32, 24);
      craniumGeo.scale(0.9, 1.15, 1.0);
      const craniumMat = new THREE.MeshStandardMaterial({
        color: 0x0C152B,
        metalness: 0.85,
        roughness: 0.2,
      });
      const cranium = new THREE.Mesh(craniumGeo, craniumMat);
      cranium.position.y = 0.2;
      botGroup.add(cranium);

      // 2. Sculpted Faceplate & Jaw Shield
      const faceplateGeo = new THREE.ConeGeometry(0.85, 1.2, 5);
      const faceplateMat = new THREE.MeshStandardMaterial({
        color: 0x1FB6C9,
        metalness: 0.9,
        roughness: 0.25,
        emissive: 0x0D4D61,
        emissiveIntensity: 0.4,
      });
      const faceplate = new THREE.Mesh(faceplateGeo, faceplateMat);
      faceplate.rotation.x = Math.PI;
      faceplate.position.set(0, -0.15, 0.45);
      faceplate.scale.set(0.9, 1.0, 0.5);
      botGroup.add(faceplate);

      // 3. Panoramic Optical Eye Visor (Curved horizontal glowing sensor bar)
      const visorGeo = new THREE.TorusGeometry(0.82, 0.16, 16, 32, Math.PI * 0.7);
      const visorMat = new THREE.MeshStandardMaterial({
        color: 0x050C1A,
        metalness: 0.95,
        roughness: 0.1,
      });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.rotation.x = Math.PI * 0.15;
      visor.rotation.z = -Math.PI * 0.35;
      visor.position.set(0, 0.28, 0.42);
      botGroup.add(visor);

      // Bright Cyan Laser Scanning Eye Slit
      const laserEyeGeo = new THREE.BoxGeometry(0.7, 0.1, 0.25);
      const laserEyeMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF });
      const laserEye = new THREE.Mesh(laserEyeGeo, laserEyeMat);
      laserEye.position.set(0, 0.28, 0.86);
      botGroup.add(laserEye);

      // Central High-Precision Retina Target
      const retinaGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const retinaMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
      const retina = new THREE.Mesh(retinaGeo, retinaMat);
      retina.position.set(0, 0.28, 0.92);
      botGroup.add(retina);

      // 4. Cybernetic Temple Audio/Sensor Nodes (Left & Right)
      const earGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.25, 24);
      const earMat = new THREE.MeshStandardMaterial({
        color: 0x00E5FF,
        metalness: 0.9,
        roughness: 0.2,
      });
      const earL = new THREE.Mesh(earGeo, earMat);
      earL.rotation.z = Math.PI / 2;
      earL.position.set(-0.95, 0.2, 0);
      botGroup.add(earL);

      const earR = new THREE.Mesh(earGeo, earMat);
      earR.rotation.z = Math.PI / 2;
      earR.position.set(0.95, 0.2, 0);
      botGroup.add(earR);

      // Copper Core Inserts for Ears
      const earCoreGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.28, 16);
      const earCoreMat = new THREE.MeshBasicMaterial({ color: 0xF2822B });
      const earCoreL = new THREE.Mesh(earCoreGeo, earCoreMat);
      earCoreL.rotation.z = Math.PI / 2;
      earCoreL.position.set(-0.96, 0.2, 0);
      botGroup.add(earCoreL);

      const earCoreR = new THREE.Mesh(earCoreGeo, earCoreMat);
      earCoreR.rotation.z = Math.PI / 2;
      earCoreR.position.set(0.96, 0.2, 0);
      botGroup.add(earCoreR);

      // 5. Articulated Neck Gimbal & Collar
      const neckGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.6, 16);
      const neckMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.8 });
      const neck = new THREE.Mesh(neckGeo, neckMat);
      neck.position.set(0, -0.9, 0);
      botGroup.add(neck);

      // Hydraulic Damper Rods
      const rodGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 12);
      const rodMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.95 });
      const rodL = new THREE.Mesh(rodGeo, rodMat);
      rodL.position.set(-0.35, -0.85, 0.1);
      botGroup.add(rodL);
      const rodR = new THREE.Mesh(rodGeo, rodMat);
      rodR.position.set(0.35, -0.85, 0.1);
      botGroup.add(rodR);

      // 6. Floating Holographic Neural Ring Halo
      const haloGeo = new THREE.TorusGeometry(1.35, 0.03, 16, 48);
      const haloMat = new THREE.MeshStandardMaterial({
        color: 0x00E5FF,
        emissive: 0x00B4D8,
        emissiveIntensity: 0.7,
        wireframe: true,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2.5;
      halo.position.y = 0.85;
      botGroup.add(halo);

      animObjects.push({
        update: (elapsed, hovered) => {
          const speed = hovered ? 2.8 : 1.1;
          botGroup.rotation.y = Math.sin(elapsed * speed * 0.7) * 0.38;
          botGroup.rotation.x = Math.cos(elapsed * speed * 0.5) * 0.15;
          botGroup.position.y = Math.sin(elapsed * speed) * 0.08;

          // Scanning laser eye sweep
          const sweep = Math.sin(elapsed * speed * 3.2) * 0.26;
          laserEye.position.x = sweep;
          retina.position.x = sweep;

          // Halo rotation
          halo.rotation.z += 0.02 * speed;
          halo.rotation.x = Math.PI / 2.5 + Math.sin(elapsed * 2) * 0.1;
        },
        dispose: () => {
          craniumGeo.dispose();
          craniumMat.dispose();
          faceplateGeo.dispose();
          faceplateMat.dispose();
          visorGeo.dispose();
          visorMat.dispose();
          laserEyeGeo.dispose();
          laserEyeMat.dispose();
          retinaGeo.dispose();
          retinaMat.dispose();
          earGeo.dispose();
          earMat.dispose();
          earCoreGeo.dispose();
          earCoreMat.dispose();
          neckGeo.dispose();
          neckMat.dispose();
          rodGeo.dispose();
          rodMat.dispose();
          haloGeo.dispose();
          haloMat.dispose();
        },
      });
    } else if (track === 'spacetech') {
      // ----------------------------------------------------
      // SPACETECH: 3D Orbital Satellite with Dual Solar Wings & Antenna
      // ----------------------------------------------------
      // 1. Central Satellite Bus Body
      const busGeo = new THREE.BoxGeometry(1.0, 1.0, 1.4);
      const busMat = new THREE.MeshStandardMaterial({
        color: 0x6C4FE0,
        metalness: 0.85,
        roughness: 0.25,
        emissive: 0x4125B8,
        emissiveIntensity: 0.5,
      });
      const bus = new THREE.Mesh(busGeo, busMat);
      group.add(bus);

      // Gold Foil Accents
      const foilGeo = new THREE.BoxGeometry(0.6, 0.6, 1.45);
      const foilMat = new THREE.MeshStandardMaterial({ color: 0xF2822B, metalness: 0.9, roughness: 0.1 });
      const foil = new THREE.Mesh(foilGeo, foilMat);
      group.add(foil);

      // 2. Solar Panel Wings (Left & Right)
      const wingGeo = new THREE.BoxGeometry(2.2, 0.8, 0.06);
      const wingMat = new THREE.MeshStandardMaterial({
        color: 0x1FB6C9,
        emissive: 0x0B4A5C,
        emissiveIntensity: 0.6,
        metalness: 0.8,
        wireframe: false,
      });

      const wingL = new THREE.Mesh(wingGeo, wingMat);
      wingL.position.set(-1.8, 0, 0);
      group.add(wingL);

      const wingR = new THREE.Mesh(wingGeo, wingMat);
      wingR.position.set(1.8, 0, 0);
      group.add(wingR);

      // 3. Parabolic Dish Antenna
      const dishGeo = new THREE.ConeGeometry(0.7, 0.4, 24, 1, true);
      const dishMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.9, side: THREE.DoubleSide });
      const dish = new THREE.Mesh(dishGeo, dishMat);
      dish.position.set(0, 0.9, 0.4);
      dish.rotation.x = Math.PI / 3;
      group.add(dish);

      animObjects.push({
        update: (elapsed, hovered) => {
          const speed = hovered ? 2.5 : 1.0;
          group.rotation.y += 0.02 * speed;
          group.rotation.x = Math.sin(elapsed * speed * 0.7) * 0.3;
          group.rotation.z = Math.cos(elapsed * speed * 0.5) * 0.2;
          dish.rotation.y += 0.04 * speed;
        },
        dispose: () => {
          busGeo.dispose();
          busMat.dispose();
          foilGeo.dispose();
          foilMat.dispose();
          wingGeo.dispose();
          wingMat.dispose();
          dishGeo.dispose();
          dishMat.dispose();
        },
      });
    } else if (track === 'embedded') {
      // ----------------------------------------------------
      // EMBEDDED: 3D Microcontroller Chip on a PCB with Pins & Signal Pulses
      // ----------------------------------------------------
      const chipGroup = new THREE.Group();
      chipGroup.rotation.x = 0.9;
      group.add(chipGroup);

      // 1. PCB board
      const pcbGeo = new THREE.BoxGeometry(3.0, 2.2, 0.08);
      const pcbMat = new THREE.MeshStandardMaterial({
        color: 0x3F9142,
        emissive: 0x1F5C22,
        emissiveIntensity: 0.5,
        metalness: 0.4,
        roughness: 0.5,
      });
      const pcb = new THREE.Mesh(pcbGeo, pcbMat);
      chipGroup.add(pcb);

      // 2. Chip package
      const icGeo = new THREE.BoxGeometry(1.2, 1.2, 0.25);
      const icMat = new THREE.MeshStandardMaterial({ color: 0x0B1739, metalness: 0.7, roughness: 0.3 });
      const ic = new THREE.Mesh(icGeo, icMat);
      ic.position.z = 0.17;
      chipGroup.add(ic);

      // Glowing die marker on top of the chip
      const dieGeo = new THREE.BoxGeometry(0.5, 0.5, 0.02);
      const dieMat = new THREE.MeshBasicMaterial({ color: 0x74D977 });
      const die = new THREE.Mesh(dieGeo, dieMat);
      die.position.z = 0.31;
      chipGroup.add(die);

      // 3. Gold pins on all four sides
      const pinGeo = new THREE.BoxGeometry(0.08, 0.22, 0.05);
      const pinMat = new THREE.MeshStandardMaterial({ color: 0xF2C14E, metalness: 0.95, roughness: 0.15 });
      for (let side = 0; side < 4; side++) {
        for (let i = 0; i < 5; i++) {
          const pin = new THREE.Mesh(pinGeo, pinMat);
          const offset = -0.44 + i * 0.22;
          if (side === 0) pin.position.set(offset, 0.71, 0.08);
          if (side === 1) pin.position.set(offset, -0.71, 0.08);
          if (side === 2) { pin.position.set(0.71, offset, 0.08); pin.rotation.z = Math.PI / 2; }
          if (side === 3) { pin.position.set(-0.71, offset, 0.08); pin.rotation.z = Math.PI / 2; }
          chipGroup.add(pin);
        }
      }

      // 4. Copper traces running out to the board edges
      const traceGeo = new THREE.BoxGeometry(0.04, 1, 0.02);
      const traceMat = new THREE.MeshStandardMaterial({ color: 0xF2822B, metalness: 0.9, roughness: 0.2 });
      const traces: { x: number; y: number; len: number; horizontal: boolean }[] = [
        { x: -0.22, y: 0.95, len: 0.3, horizontal: false },
        { x: 0.22, y: -0.95, len: 0.3, horizontal: false },
        { x: 1.15, y: 0.22, len: 0.7, horizontal: true },
        { x: -1.15, y: -0.22, len: 0.7, horizontal: true },
      ];
      traces.forEach((t) => {
        const tr = new THREE.Mesh(traceGeo, traceMat);
        tr.scale.y = t.len;
        tr.position.set(t.x, t.y, 0.05);
        if (t.horizontal) tr.rotation.z = Math.PI / 2;
        chipGroup.add(tr);
      });

      // 5. Signal pulses travelling along the horizontal traces
      const pulseGeo = new THREE.SphereGeometry(0.07, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0x00E5FF });
      const pulseR = new THREE.Mesh(pulseGeo, pulseMat);
      const pulseL = new THREE.Mesh(pulseGeo, pulseMat);
      chipGroup.add(pulseR, pulseL);

      animObjects.push({
        update: (elapsed, hovered) => {
          const speed = hovered ? 2.6 : 1.0;
          chipGroup.rotation.z = Math.sin(elapsed * 0.6 * speed) * 0.5;
          chipGroup.position.y = Math.sin(elapsed * 1.5) * 0.1;
          const t = (elapsed * 0.8 * speed) % 1;
          pulseR.position.set(0.8 + t * 0.7, 0.22, 0.08);
          pulseL.position.set(-0.8 - t * 0.7, -0.22, 0.08);
          dieMat.color.setHSL(0.33, 0.6, 0.5 + Math.sin(elapsed * 4 * speed) * 0.15);
        },
        dispose: () => {
          pcbGeo.dispose();
          pcbMat.dispose();
          icGeo.dispose();
          icMat.dispose();
          dieGeo.dispose();
          dieMat.dispose();
          pinGeo.dispose();
          pinMat.dispose();
          traceGeo.dispose();
          traceMat.dispose();
          pulseGeo.dispose();
          pulseMat.dispose();
        },
      });
    } else if (track === 'bim') {
      // ----------------------------------------------------
      // BIM: 3D Building Model with Floor Slabs, Wireframe Grid & Scan Plane
      // ----------------------------------------------------
      const bimGroup = new THREE.Group();
      bimGroup.position.y = -0.2;
      group.add(bimGroup);

      // 1. Stacked floor slabs (solid) with a wireframe envelope around them
      const floors = 4;
      const slabGeo = new THREE.BoxGeometry(1.6, 0.08, 1.2);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x6C4FE0,
        emissive: 0x4125B8,
        emissiveIntensity: 0.5,
        metalness: 0.7,
        roughness: 0.3,
      });
      const slabs: THREE.Mesh[] = [];
      for (let i = 0; i < floors; i++) {
        const slab = new THREE.Mesh(slabGeo, slabMat);
        slab.position.y = -0.9 + i * 0.6;
        bimGroup.add(slab);
        slabs.push(slab);
      }

      // 2. Corner columns
      const colGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.9, 8);
      const colMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.9, roughness: 0.15 });
      [[-0.7, -0.5], [0.7, -0.5], [-0.7, 0.5], [0.7, 0.5]].forEach(([x, z]) => {
        const col = new THREE.Mesh(colGeo, colMat);
        col.position.set(x, 0, z);
        bimGroup.add(col);
      });

      // 3. Wireframe building envelope
      const shellGeo = new THREE.BoxGeometry(1.75, 2.0, 1.35);
      const shellMat = new THREE.MeshBasicMaterial({ color: 0x1FB6C9, wireframe: true, transparent: true, opacity: 0.6 });
      const shell = new THREE.Mesh(shellGeo, shellMat);
      bimGroup.add(shell);

      // 4. Site grid underneath
      const grid = new THREE.GridHelper(3.2, 8, 0xF2822B, 0x6C4FE0);
      grid.position.y = -1.0;
      bimGroup.add(grid);

      // 5. Clash-detection scan plane sweeping up the building
      const scanGeo = new THREE.PlaneGeometry(2.0, 1.6);
      const scanMat = new THREE.MeshBasicMaterial({
        color: 0xF2822B,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
      });
      const scan = new THREE.Mesh(scanGeo, scanMat);
      scan.rotation.x = Math.PI / 2;
      bimGroup.add(scan);

      animObjects.push({
        update: (elapsed, hovered) => {
          const speed = hovered ? 2.5 : 1.0;
          bimGroup.rotation.y += 0.012 * speed;
          bimGroup.rotation.x = 0.35 + Math.sin(elapsed * 0.7) * 0.08;
          // Floors spread apart on hover like an exploded model view
          slabs.forEach((s, i) => {
            const target = -0.9 + i * (hovered ? 0.72 : 0.6);
            s.position.y += (target - s.position.y) * 0.08;
          });
          scan.position.y = -1.0 + ((elapsed * 0.6 * speed) % 1) * 2.0;
          scanMat.opacity = 0.15 + Math.sin(elapsed * 5) * 0.1;
        },
        dispose: () => {
          slabGeo.dispose();
          slabMat.dispose();
          colGeo.dispose();
          colMat.dispose();
          shellGeo.dispose();
          shellMat.dispose();
          grid.geometry.dispose();
          (grid.material as THREE.Material).dispose();
          scanGeo.dispose();
          scanMat.dispose();
        },
      });
    } else if (track === 'content') {
      // ----------------------------------------------------
      // CONTENT CREATION: Film Clapperboard that snaps shut, a glowing Play button,
      // orbiting video thumbnails and a spinning AI spark
      // ----------------------------------------------------
      const contentGroup = new THREE.Group();
      contentGroup.scale.setScalar(0.85);
      group.add(contentGroup);

      // 1. Clapperboard slate (body)
      const slateGeo = new THREE.BoxGeometry(2.2, 1.4, 0.25);
      const slateMat = new THREE.MeshStandardMaterial({ color: 0x1E1B3A, metalness: 0.4, roughness: 0.35, emissive: 0x110E2A, emissiveIntensity: 0.4 });
      const slate = new THREE.Mesh(slateGeo, slateMat);
      slate.position.y = -0.3;
      contentGroup.add(slate);

      // 2. Hinged clapper arm with diagonal stripes (pivots at the top-left corner)
      const hinge = new THREE.Group();
      hinge.position.set(-1.1, 0.42, 0);
      contentGroup.add(hinge);

      const armGeo = new THREE.BoxGeometry(2.2, 0.32, 0.25);
      const arm = new THREE.Mesh(armGeo, slateMat);
      arm.position.set(1.1, 0.16, 0);
      hinge.add(arm);

      const stripeGeo = new THREE.BoxGeometry(0.16, 0.34, 0.27);
      const stripeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xDDDDEE, emissiveIntensity: 0.3 });
      for (let i = 0; i < 5; i++) {
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.set(0.25 + i * 0.43, 0.16, 0);
        stripe.rotation.z = 0.5;
        hinge.add(stripe);
      }

      // 3. Glowing Play button on the slate
      const playGeo = new THREE.CircleGeometry(0.32, 3); // 3 segments = a triangle pointing right
      const playMat = new THREE.MeshStandardMaterial({ color: 0xF2822B, emissive: 0xF2822B, emissiveIntensity: 0.9, side: THREE.DoubleSide });
      const play = new THREE.Mesh(playGeo, playMat);
      play.position.set(0.05, -0.3, 0.14);
      contentGroup.add(play);

      const ringGeo = new THREE.RingGeometry(0.46, 0.53, 40);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xF2822B, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, -0.3, 0.14);
      contentGroup.add(ring);

      // 4. Video thumbnails orbiting the board
      const tileGeo = new THREE.PlaneGeometry(0.55, 0.34);
      const tileMats = [0x1FB6C9, 0x6C4FE0, 0x3F9142, 0xE8467C].map(
        (c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.45, side: THREE.DoubleSide }),
      );
      const tiles = tileMats.map((m) => {
        const tile = new THREE.Mesh(tileGeo, m);
        contentGroup.add(tile);
        return tile;
      });

      // 5. AI spark
      const sparkGeo = new THREE.OctahedronGeometry(0.2);
      const sparkMat = new THREE.MeshStandardMaterial({ color: 0xFFD166, emissive: 0xFFB020, emissiveIntensity: 1.0, metalness: 0.3 });
      const spark = new THREE.Mesh(sparkGeo, sparkMat);
      spark.position.set(1.35, 1.0, 0.3);
      contentGroup.add(spark);

      animObjects.push({
        update: (elapsed, hovered) => {
          const speed = hovered ? 2.2 : 1.0;
          contentGroup.rotation.y = Math.sin(elapsed * 0.6) * 0.5;
          contentGroup.rotation.x = 0.1 + Math.sin(elapsed * 0.8) * 0.06;

          // Clapper: slowly opens, holds, then snaps shut ("Action!")
          const t = (elapsed * speed) % 2;
          const open = t < 0.4 ? t / 0.4 : t < 1.75 ? 1 : Math.max(0, 1 - (t - 1.75) / 0.12);
          hinge.rotation.z = 0.5 * open;

          // Play button pulses
          const pulse = 1 + Math.sin(elapsed * 4 * speed) * 0.08;
          play.scale.setScalar(pulse);
          ring.scale.setScalar(1 + ((elapsed * speed) % 1) * 0.35);
          ringMat.opacity = 0.8 * (1 - ((elapsed * speed) % 1));

          // Thumbnails circle the board, always facing the camera
          tiles.forEach((tile, i) => {
            const a = elapsed * 0.7 * speed + (i * Math.PI) / 2;
            tile.position.set(Math.cos(a) * 1.9, 0.1 + Math.sin(a * 2) * 0.25, Math.sin(a) * 1.0);
            tile.rotation.y = -contentGroup.rotation.y;
          });

          spark.rotation.y += 0.05 * speed;
          spark.rotation.x += 0.03 * speed;
          spark.scale.setScalar(1 + Math.sin(elapsed * 6) * 0.15);
        },
        dispose: () => {
          slateGeo.dispose();
          slateMat.dispose();
          armGeo.dispose();
          stripeGeo.dispose();
          stripeMat.dispose();
          playGeo.dispose();
          playMat.dispose();
          ringGeo.dispose();
          ringMat.dispose();
          tileGeo.dispose();
          tileMats.forEach((m) => m.dispose());
          sparkGeo.dispose();
          sparkMat.dispose();
        },
      });
    }

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    let visible = false;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!visible) return;
      const elapsed = clock.getElapsedTime();

      animObjects.forEach((obj) => obj.update(elapsed, hoveredRef.current));

      renderer.render(scene, camera);
    };

    // Only render while the card is actually on screen.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(mount);

    animate();

    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth || 240;
      camera.aspect = newW / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      animObjects.forEach((obj) => obj.dispose());
      ambientLight.dispose();
      dirLight1.dispose();
      dirLight2.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [track, accentColor]);

  return (
    <div
      ref={mountRef}
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
      className="relative w-full h-[140px] flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105"
      title={`Interactive 3D ${track} simulator`}
    >
      {/* Visual pulse glow underneath 3D model */}
      <div
        className="absolute inset-x-8 bottom-2 h-8 rounded-full blur-xl pointer-events-none opacity-50"
        style={{
          backgroundColor:
            track === 'cybersecurity'
              ? '#F2822B'
              : track === 'robotics'
              ? '#1FB6C9'
              : track === 'embedded'
              ? '#3F9142'
              : track === 'content'
              ? '#E8467C'
              : '#6C4FE0',
        }}
      />
    </div>
  );
}
