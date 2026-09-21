import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface WorkshopCard3DProps {
  track: 'cybersecurity' | 'robotics' | 'spacetech' | 'agritech';
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
    } else {
      // ----------------------------------------------------
      // AGRITECH: 3D Autonomous Agricultural Drone with Spinning Rotors
      // ----------------------------------------------------
      // 1. Drone Center Fuselage
      const droneBodyGeo = new THREE.CylinderGeometry(0.7, 0.8, 0.35, 8);
      const droneMat = new THREE.MeshStandardMaterial({
        color: 0x3F9142,
        emissive: 0x1F5C22,
        emissiveIntensity: 0.6,
        metalness: 0.8,
      });
      const droneBody = new THREE.Mesh(droneBodyGeo, droneMat);
      group.add(droneBody);

      // 2. Four Drone Arms
      const armGeo = new THREE.BoxGeometry(2.6, 0.08, 0.12);
      const droneArmMat = new THREE.MeshStandardMaterial({ color: 0x0B1739, metalness: 0.9 });
      const arm1 = new THREE.Mesh(armGeo, droneArmMat);
      arm1.rotation.y = Math.PI / 4;
      group.add(arm1);

      const arm2 = new THREE.Mesh(armGeo, droneArmMat);
      arm2.rotation.y = -Math.PI / 4;
      group.add(arm2);

      // 3. Four Propeller Rotors
      const propGeo = new THREE.BoxGeometry(0.8, 0.02, 0.1);
      const propMat = new THREE.MeshBasicMaterial({ color: 0x1FB6C9 });
      const props: THREE.Mesh[] = [];

      const motorOffsets = [
        { x: 0.9, z: 0.9 },
        { x: -0.9, z: 0.9 },
        { x: 0.9, z: -0.9 },
        { x: -0.9, z: -0.9 },
      ];

      motorOffsets.forEach((off) => {
        const motorGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.25, 12);
        const motor = new THREE.Mesh(motorGeo, droneArmMat);
        motor.position.set(off.x, 0.15, off.z);
        group.add(motor);

        const prop = new THREE.Mesh(propGeo, propMat);
        prop.position.set(off.x, 0.3, off.z);
        group.add(prop);
        props.push(prop);
      });

      // 4. Downward LiDAR crop scanner beam cone
      const coneGeo = new THREE.ConeGeometry(1.2, 1.6, 16, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: 0x74D977,
        transparent: true,
        opacity: 0.35,
        wireframe: true,
        side: THREE.DoubleSide,
      });
      const scannerCone = new THREE.Mesh(coneGeo, coneMat);
      scannerCone.position.set(0, -1.0, 0);
      group.add(scannerCone);

      animObjects.push({
        update: (elapsed, hovered) => {
          const propSpeed = hovered ? 0.8 : 0.4;
          props.forEach((p, idx) => {
            p.rotation.y += propSpeed * (idx % 2 === 0 ? 1 : -1);
          });
          group.position.y = Math.sin(elapsed * 2.5) * 0.2;
          group.rotation.x = Math.sin(elapsed * 1.5) * 0.15;
          group.rotation.z = Math.cos(elapsed * 1.8) * 0.15;
          scannerCone.rotation.y += 0.05;
          const pulse = 0.25 + Math.sin(elapsed * 5) * 0.15;
          coneMat.opacity = pulse;
        },
        dispose: () => {
          droneBodyGeo.dispose();
          droneMat.dispose();
          armGeo.dispose();
          droneArmMat.dispose();
          propGeo.dispose();
          propMat.dispose();
          coneGeo.dispose();
          coneMat.dispose();
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
              : track === 'spacetech'
              ? '#6C4FE0'
              : '#3F9142',
        }}
      />
    </div>
  );
}
