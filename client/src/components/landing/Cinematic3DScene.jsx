import { useEffect, useRef } from "react";
import * as THREE from "three";
import useTheme from "../../hooks/useTheme";

/**
 * Cinematic3DScene
 *
 * An immersive, fully 3D interactive product film driven by continuous scroll,
 * camera flight, physical 3D skill objects, dynamic lighting, particle streams,
 * and mouse parallax raycasting.
 *
 * Chapters:
 * 0%   -> Hero / Discover: Wide 3D environment, separated avatars, 7 physical skills, idle sway
 * 25%  -> Match: Avatars converge, 3D compatibility gyroscope forms with 92% Match emblem
 * 50%  -> Exchange: Skills physically fly along dual 3D Catmull-Rom splines with particle trails
 * 75%  -> Learn: Collaborative geometric structures, harmonic resonance rings, shared energy
 * 100% -> Grow: Camera pulls far back revealing 24+ node community constellation web
 */
export default function Cinematic3DScene({ scrollProgressRef, onSkillHover }) {
  const mountRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDark ? 0x0a0d0b : 0xf5f4ee, 0.045);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      120
    );
    camera.position.set(0, 0.8, 7.2);

    // 2. Renderer with tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.25 : 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Dynamic Lighting System
    const ambientLight = new THREE.AmbientLight(
      isDark ? 0x18241c : 0xf7f5eb,
      isDark ? 2.2 : 2.6
    );
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(
      isDark ? 0x3fa873 : 0x1b4332,
      isDark ? 3.6 : 3.0
    );
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(
      isDark ? 0xd4a017 : 0xb8860b,
      isDark ? 2.0 : 1.6
    );
    fillLight.position.set(-6, -3, 4);
    scene.add(fillLight);

    const centerPointLight = new THREE.PointLight(
      isDark ? 0x4ade80 : 0x2d6a4f,
      2.5,
      14
    );
    centerPointLight.position.set(0, 0.2, 1.2);
    scene.add(centerPointLight);

    const stageSpotLight = new THREE.SpotLight(
      isDark ? 0x38bdf8 : 0x1b4332,
      2.0,
      16,
      Math.PI / 4,
      0.4
    );
    stageSpotLight.position.set(0, 6, 4);
    scene.add(stageSpotLight);

    // 4. Helper: High-Resolution Spatial 3D Text Sprite
    const createTextSprite = (text, bgColor, textColor = "#ffffff", borderGlow = "rgba(255,255,255,0.4)") => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(8, 8, 240, 48, 24);
      ctx.fill();

      ctx.strokeStyle = borderGlow;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = "600 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 128, 32);

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.92,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(0.92, 0.23, 1);
      return sprite;
    };

    // 5. Stylized 3D Avatars (Person A & Person B)
    const emeraldMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x2d7a52 : 0x1b4332,
      roughness: 0.18,
      metalness: 0.45,
      emissive: isDark ? 0x163826 : 0x0d281e,
      emissiveIntensity: 0.7,
    });

    const amberMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xd97706 : 0xb8860b,
      roughness: 0.2,
      metalness: 0.4,
      emissive: isDark ? 0x78350f : 0x451a03,
      emissiveIntensity: 0.6,
    });

    const glassRingMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x4ade80 : 0x1b4332,
      transmission: 0.7,
      opacity: 0.9,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
      wireframe: true,
    });

    // Person A (Left)
    const personAGroup = new THREE.Group();
    const headGeom = new THREE.SphereGeometry(0.48, 32, 32);
    const headA = new THREE.Mesh(headGeom, emeraldMat);
    personAGroup.add(headA);

    const ringA1 = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.03, 16, 64), glassRingMat);
    ringA1.rotation.x = Math.PI / 2.8;
    personAGroup.add(ringA1);

    const ringA2 = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.02, 16, 64), glassRingMat);
    ringA2.rotation.y = Math.PI / 3;
    personAGroup.add(ringA2);
    scene.add(personAGroup);

    // Person B (Right)
    const personBGroup = new THREE.Group();
    const headB = new THREE.Mesh(headGeom, amberMat);
    personBGroup.add(headB);

    const ringB1 = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.03, 16, 64), glassRingMat);
    ringB1.rotation.x = -Math.PI / 2.8;
    personBGroup.add(ringB1);

    const ringB2 = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.02, 16, 64), glassRingMat);
    ringB2.rotation.y = -Math.PI / 3;
    personBGroup.add(ringB2);
    scene.add(personBGroup);

    // 6. Physical 3D Skill Objects
    // 7 skills with distinct geometry and materials
    const skillConfigs = [
      {
        id: "react",
        name: "React",
        color: 0x38bdf8,
        emissive: 0x0284c7,
        geom: new THREE.IcosahedronGeometry(0.32, 1),
        owner: "A",
        orbitRadius: 1.35,
        baseAngle: 0,
        isExchanging: true,
        destination: "B",
      },
      {
        id: "typescript",
        name: "TypeScript",
        color: 0x60a5fa,
        emissive: 0x1d4ed8,
        geom: new THREE.DodecahedronGeometry(0.28, 0),
        owner: "A",
        orbitRadius: 1.6,
        baseAngle: (Math.PI * 2) / 3,
      },
      {
        id: "python",
        name: "Python",
        color: 0xfacc15,
        emissive: 0xa16207,
        geom: new THREE.TorusGeometry(0.22, 0.08, 16, 32),
        owner: "A",
        orbitRadius: 1.8,
        baseAngle: (Math.PI * 4) / 3,
      },
      {
        id: "uiux",
        name: "UI/UX Design",
        color: 0xf472b6,
        emissive: 0xdb2777,
        geom: new THREE.CylinderGeometry(0.26, 0.26, 0.22, 24),
        owner: "B",
        orbitRadius: 1.35,
        baseAngle: Math.PI / 2,
        isExchanging: true,
        destination: "A",
      },
      {
        id: "javascript",
        name: "JavaScript",
        color: 0xfbbf24,
        emissive: 0xb45309,
        geom: new THREE.BoxGeometry(0.38, 0.38, 0.38),
        owner: "B",
        orbitRadius: 1.65,
        baseAngle: Math.PI + 0.5,
        isExchanging: true,
        destination: "A",
      },
      {
        id: "nodejs",
        name: "Node.js",
        color: 0x4ade80,
        emissive: 0x15803d,
        geom: new THREE.OctahedronGeometry(0.32, 0),
        owner: "B",
        orbitRadius: 1.9,
        baseAngle: Math.PI * 1.7,
      },
      {
        id: "figma",
        name: "Figma",
        color: 0xa855f7,
        emissive: 0x7e22ce,
        geom: new THREE.ConeGeometry(0.25, 0.45, 16),
        owner: "B",
        orbitRadius: 1.55,
        baseAngle: 0.2,
      },
    ];

    const skillObjects = [];
    const interactiveMeshes = [];

    skillConfigs.forEach((cfg) => {
      const group = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.emissive,
        emissiveIntensity: 0.6,
        roughness: 0.18,
        metalness: 0.65,
      });

      const mesh = new THREE.Mesh(cfg.geom, mat);
      mesh.castShadow = true;
      mesh.userData = { skillId: cfg.id, skillName: cfg.name };
      group.add(mesh);
      interactiveMeshes.push(mesh);

      // 3D Spatial label attached above the object
      const labelSprite = createTextSprite(
        cfg.name,
        isDark ? "rgba(18,24,20,0.88)" : "rgba(245,244,238,0.92)",
        isDark ? "#f2f1ec" : "#16160f",
        isDark ? "rgba(74,222,128,0.5)" : "rgba(27,67,50,0.4)"
      );
      labelSprite.position.y = 0.40;
      group.add(labelSprite);

      scene.add(group);
      skillObjects.push({
        ...cfg,
        group,
        mesh,
        material: mat,
        labelSprite,
        currentPos: new THREE.Vector3(),
      });
    });

    // 7. Physical 3D Compatibility Structure (25% Match Hub)
    const matchStructure = new THREE.Group();

    const outerRingGeom = new THREE.TorusGeometry(0.72, 0.035, 16, 64);
    const outerRing = new THREE.Mesh(
      outerRingGeom,
      new THREE.MeshStandardMaterial({
        color: isDark ? 0x3fa873 : 0x1b4332,
        emissive: isDark ? 0x3fa873 : 0x1b4332,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      })
    );
    matchStructure.add(outerRing);

    const innerRingGeom = new THREE.TorusGeometry(0.54, 0.025, 16, 48);
    const innerRing = new THREE.Mesh(
      innerRingGeom,
      new THREE.MeshStandardMaterial({
        color: isDark ? 0xd4a017 : 0xb8860b,
        emissive: isDark ? 0xd4a017 : 0xb8860b,
        emissiveIntensity: 0.7,
        roughness: 0.2,
      })
    );
    innerRing.rotation.y = Math.PI / 2.5;
    matchStructure.add(innerRing);

    // Central 3D Compatibility Emblem
    const matchEmblem = createTextSprite(
      "92% MATCH",
      isDark ? "rgba(20,38,28,0.95)" : "rgba(27,67,50,0.95)",
      isDark ? "#4ade80" : "#a7f3d0",
      "rgba(74,222,128,0.8)"
    );
    matchEmblem.scale.set(1.2, 0.3, 1);
    matchStructure.add(matchEmblem);

    matchStructure.scale.set(0, 0, 0); // Hidden initially
    scene.add(matchStructure);

    // 8. 3D Connection Curve & Glowing Spline
    const curvePointsCount = 60;
    const connectionPositions = new Float32Array(curvePointsCount * 3);
    const connectionGeom = new THREE.BufferGeometry();
    connectionGeom.setAttribute("position", new THREE.BufferAttribute(connectionPositions, 3));
    const connectionMat = new THREE.LineBasicMaterial({
      color: isDark ? 0x4ade80 : 0x1b4332,
      transparent: true,
      opacity: 0,
    });
    const connectionLine = new THREE.Line(connectionGeom, connectionMat);
    scene.add(connectionLine);

    // 9. Particle Stream for Active Skill Flight (50% Exchange)
    const trailParticleCount = 80;
    const trailPositions = new Float32Array(trailParticleCount * 3);
    const trailGeom = new THREE.BufferGeometry();
    trailGeom.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
    const trailMat = new THREE.PointsMaterial({
      color: isDark ? 0x38bdf8 : 0x1b4332,
      size: 0.06,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const trailParticles = new THREE.Points(trailGeom, trailMat);
    scene.add(trailParticles);

    // 10. Collaborative Geometric Structure (75% Learn)
    const collaborativeSpace = new THREE.Group();
    const polyGeom = new THREE.OctahedronGeometry(0.4, 0);
    const polyMesh = new THREE.Mesh(
      polyGeom,
      new THREE.MeshStandardMaterial({
        color: isDark ? 0x38bdf8 : 0x2d6a4f,
        wireframe: true,
        emissive: isDark ? 0x0284c7 : 0x1b4332,
        emissiveIntensity: 0.8,
      })
    );
    collaborativeSpace.add(polyMesh);

    const learnRingGeom = new THREE.TorusGeometry(0.8, 0.02, 16, 64);
    const learnRing = new THREE.Mesh(learnRingGeom, glassRingMat);
    learnRing.rotation.x = Math.PI / 2;
    collaborativeSpace.add(learnRing);

    collaborativeSpace.scale.set(0, 0, 0);
    scene.add(collaborativeSpace);

    // 11. Living Community Network Constellation (100% Grow)
    const communityNodes = [];
    const totalCommunity = 24;
    const maxCommunityLines = totalCommunity * 4;
    const communityLinesPositions = new Float32Array(maxCommunityLines * 6);
    const communityLinesGeom = new THREE.BufferGeometry();
    communityLinesGeom.setAttribute("position", new THREE.BufferAttribute(communityLinesPositions, 3));
    const communityLinesMat = new THREE.LineBasicMaterial({
      color: isDark ? 0x3fa873 : 0x1b4332,
      transparent: true,
      opacity: 0,
    });
    const communityLines = new THREE.LineSegments(communityLinesGeom, communityLinesMat);
    scene.add(communityLines);

    // Generate 24 distributed community nodes on Fibonacci sphere
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < totalCommunity; i++) {
      const theta = (2 * Math.PI * i) / goldenRatio;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / totalCommunity);
      const radius = 3.2 + (i % 3) * 0.9;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.cos(phi) * 0.85;
      const z = radius * Math.sin(theta) * Math.sin(phi) * 0.7;

      const nodeGeom = new THREE.SphereGeometry(0.12, 16, 16);
      const nodeMesh = new THREE.Mesh(
        nodeGeom,
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? (isDark ? 0x3fa873 : 0x1b4332) : (isDark ? 0xd4a017 : 0xb8860b),
          emissive: i % 2 === 0 ? 0x1b4332 : 0x78350f,
          emissiveIntensity: 0.5,
        })
      );
      nodeMesh.scale.set(0, 0, 0);
      scene.add(nodeMesh);

      communityNodes.push({
        mesh: nodeMesh,
        targetPos: new THREE.Vector3(x, y, z),
      });
    }

    // 12. Floating Ambient Celestial Dust
    const dustCount = 80;
    const dustGeom = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPos[i] = (Math.random() - 0.5) * 16;
      dustPos[i + 1] = (Math.random() - 0.5) * 12;
      dustPos[i + 2] = (Math.random() - 0.5) * 10;
    }
    dustGeom.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: isDark ? 0x4ade80 : 0x1b4332,
      size: 0.035,
      transparent: true,
      opacity: isDark ? 0.5 : 0.3,
    });
    const dustParticles = new THREE.Points(dustGeom, dustMat);
    scene.add(dustParticles);

    // 13. Interactive Raycasting & Pointer Parallax
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);
    let hasPointerMoved = false;
    let hoveredSkill = null;

    const handlePointerMove = (e) => {
      hasPointerMoved = true;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      targetMouse.set(x, y);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    // 14. Continuous 3D Story Animation Loop
    let currentProgress = 0.0;
    let clock = new THREE.Clock();
    let animationFrameId;

    const render = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Read target scroll progress from parent (0.0 to 1.0)
      const rawTarget = typeof scrollProgressRef?.current === "number" ? scrollProgressRef.current : 0;
      const targetProgress = Math.max(0, Math.min(1, rawTarget));

      // Adaptive inertial smoothing: fast on jumps, smooth on scroll
      const diff = targetProgress - currentProgress;
      const adaptiveFactor = Math.min(0.25, 0.09 + Math.abs(diff) * 0.35);
      currentProgress += diff * adaptiveFactor;
      const p = currentProgress;

      if (typeof window !== "undefined") {
        window.__SKILLSWAP_3D_PROGRESS = p;
        window.__SKILLSWAP_SET_PROGRESS = (val) => {
          currentProgress = Math.max(0, Math.min(1, val));
        };
      }

      // Smooth pointer parallax
      mouse.lerp(targetMouse, 0.06);

      // ==============================================================
      // RAYCASTING HOVER INTERACTION ON PHYSICAL 3D SKILL OBJECTS
      // ==============================================================
      if (hasPointerMoved) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshes);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object;
          if (hoveredSkill !== hitMesh) {
            if (hoveredSkill) {
              hoveredSkill.material.emissiveIntensity = 0.6;
              hoveredSkill.scale.set(1, 1, 1);
            }
            hoveredSkill = hitMesh;
            hoveredSkill.material.emissiveIntensity = 1.3;
            hoveredSkill.scale.set(1.2, 1.2, 1.2);
            if (onSkillHover) onSkillHover(hitMesh.userData.skillName);
          }
        } else if (hoveredSkill) {
          hoveredSkill.material.emissiveIntensity = 0.6;
          hoveredSkill.scale.set(1, 1, 1);
          hoveredSkill = null;
          if (onSkillHover) onSkillHover(null);
        }
      }

      // ==============================================================
      // 1. DISCOVER STAGE (0% -> 25%)
      // ==============================================================
      // Avatars approach each other from distant outer flanks:
      // p = 0.0: Person A at -2.9, Person B at +2.9
      // p = 0.25: Person A at -1.2, Person B at +1.2
      const approachT = THREE.MathUtils.smoothstep(p, 0, 0.25);
      const posAX = THREE.MathUtils.lerp(-2.9, -1.2, approachT);
      const posBX = THREE.MathUtils.lerp(2.9, 1.2, approachT);

      const idleFloatA = prefersReducedMotion ? 0 : Math.sin(time * 1.4) * 0.04;
      const idleFloatB = prefersReducedMotion ? 0 : Math.sin(time * 1.4 + 1.2) * 0.04;

      personAGroup.position.set(posAX, idleFloatA, 0);
      personBGroup.position.set(posBX, idleFloatB, 0);

      if (!prefersReducedMotion) {
        ringA1.rotation.z = time * 0.45;
        ringA2.rotation.x = time * 0.35;
        ringB1.rotation.z = -time * 0.45;
        ringB2.rotation.x = -time * 0.35;
      }

      // ==============================================================
      // 2. MATCH STAGE (18% -> 40%)
      // ==============================================================
      // 3D Compatibility Structure scales into existence with counter-rotating rings
      let hubScale = 0;
      if (p >= 0.16 && p <= 0.42) {
        if (p < 0.26) {
          hubScale = THREE.MathUtils.smoothstep(p, 0.16, 0.26);
        } else {
          hubScale = 1 - THREE.MathUtils.smoothstep(p, 0.32, 0.42);
        }
      }
      matchStructure.scale.set(hubScale, hubScale, hubScale);
      matchStructure.position.set(0, Math.sin(time * 2.2) * 0.03, 0.15);
      outerRing.rotation.z = time * 0.7;
      innerRing.rotation.x = -time * 0.9;

      // 3D Bezier connection arc between A and B
      const lineOpacity = Math.min(1, Math.max(0, (p - 0.14) / 0.12));
      connectionMat.opacity = lineOpacity * (p > 0.88 ? Math.max(0, 1 - (p - 0.88) / 0.12) : 1);

      const pA = personAGroup.position;
      const pB = personBGroup.position;
      const midArchY = 0.28 * Math.sin(p * Math.PI);
      for (let i = 0; i < curvePointsCount; i++) {
        const t = i / (curvePointsCount - 1);
        const x = THREE.MathUtils.lerp(pA.x, pB.x, t);
        const y = THREE.MathUtils.lerp(pA.y, pB.y, t) + Math.sin(t * Math.PI) * midArchY;
        const z = THREE.MathUtils.lerp(pA.z, pB.z, t) + Math.sin(t * Math.PI) * 0.35;
        connectionPositions[i * 3] = x;
        connectionPositions[i * 3 + 1] = y;
        connectionPositions[i * 3 + 2] = z;
      }
      connectionGeom.attributes.position.needsUpdate = true;

      // ==============================================================
      // 3. PHYSICAL SKILL OBJECT BEHAVIORS ACROSS ALL STAGES
      // ==============================================================
      skillObjects.forEach((skill) => {
        // Individual continuous rotation
        skill.mesh.rotation.x += delta * 0.8;
        skill.mesh.rotation.y += delta * 1.1;

        if (skill.isExchanging) {
          // Skills that physically travel (React & UI/UX / JavaScript)
          if (p < 0.28) {
            // Stage 1 & 2: Orbiting origin creator
            const host = skill.owner === "A" ? pA : pB;
            const angle = skill.baseAngle + time * 0.6;
            const x = host.x + Math.cos(angle) * skill.orbitRadius;
            const y = host.y + 0.5 + Math.sin(angle) * 0.25;
            const z = host.z + Math.sin(angle * 2) * 0.35;
            skill.group.position.set(x, y, z);
          } else if (p <= 0.66) {
            // Stage 3: Active physical flight along 3D splines!
            const exchangeT = THREE.MathUtils.smoothstep(p, 0.35, 0.65);

            if (skill.id === "react") {
              // React travels from Person A (left) to Person B (right) via high forward arc
              const x = THREE.MathUtils.lerp(pA.x, pB.x, exchangeT);
              const y = 0.28 + Math.sin(exchangeT * Math.PI) * 0.52;
              const z = Math.sin(exchangeT * Math.PI) * 0.48;
              skill.group.position.set(x, y, z);

              // Update particle trail behind traveling React
              trailMat.opacity = Math.sin(exchangeT * Math.PI) * 0.9;
              for (let i = 0; i < trailParticleCount; i++) {
                const trailT = Math.max(0, exchangeT - (i / trailParticleCount) * 0.25);
                trailPositions[i * 3] = THREE.MathUtils.lerp(pA.x, pB.x, trailT) + (Math.random() - 0.5) * 0.08;
                trailPositions[i * 3 + 1] = 0.28 + Math.sin(trailT * Math.PI) * 0.52 + (Math.random() - 0.5) * 0.08;
                trailPositions[i * 3 + 2] = Math.sin(trailT * Math.PI) * 0.48 + (Math.random() - 0.5) * 0.08;
              }
              trailGeom.attributes.position.needsUpdate = true;
            } else {
              // UI/UX & JS travel from Person B (right) to Person A (left) via lower recessed arc
              const offset = skill.id === "javascript" ? 0.2 : -0.2;
              const x = THREE.MathUtils.lerp(pB.x, pA.x, exchangeT);
              const y = -0.25 + offset - Math.sin(exchangeT * Math.PI) * 0.35;
              const z = -Math.sin(exchangeT * Math.PI) * 0.42;
              skill.group.position.set(x, y, z);
            }
          } else {
            // Stage 4 & 5: Settled into orbit around new partner!
            const targetHost = skill.destination === "B" ? pB : pA;
            const postAngle = skill.baseAngle + time * 0.55;
            const x = targetHost.x + Math.cos(postAngle) * (skill.orbitRadius * 0.85);
            const y = targetHost.y + 0.4 + Math.sin(postAngle) * 0.2;
            const z = targetHost.z + Math.sin(postAngle * 2) * 0.3;
            skill.group.position.set(x, y, z);
          }
        } else {
          // Non-exchanging skills: orbit smoothly during Discover, scale gracefully
          const host = skill.owner === "A" ? pA : pB;
          const angle = skill.baseAngle + time * 0.4 + p * Math.PI * 1.5;
          // Fade down scale slightly during high-focus exchange
          const scaleFactor = Math.max(0.2, 1 - Math.min(1, Math.max(0, (p - 0.25) / 0.25) * 0.6));
          skill.group.scale.set(scaleFactor, scaleFactor, scaleFactor);
          const x = host.x + Math.cos(angle) * skill.orbitRadius;
          const y = host.y + Math.sin(angle) * 0.5;
          const z = host.z + Math.sin(angle * 2) * 0.35;
          skill.group.position.set(x, y, z);
        }
      });

      // ==============================================================
      // 4. LEARN STAGE COLLABORATIVE RESONANCE (62% -> 86%)
      // ==============================================================
      let learnScale = 0;
      if (p >= 0.62 && p <= 0.86) {
        if (p < 0.74) {
          learnScale = THREE.MathUtils.smoothstep(p, 0.62, 0.74);
        } else {
          learnScale = 1 - THREE.MathUtils.smoothstep(p, 0.78, 0.86);
        }
        centerPointLight.intensity = 2.5 + Math.sin(time * 4) * 1.2;
      }
      collaborativeSpace.scale.set(learnScale, learnScale, learnScale);
      collaborativeSpace.position.set(0, Math.sin(time * 1.5) * 0.05, 0.2);
      polyMesh.rotation.x = time * 0.8;
      polyMesh.rotation.y = time * 1.2;
      learnRing.rotation.z = time * 0.5;

      // ==============================================================
      // 5. GROW STAGE COMMUNITY CONSTELLATION (78% -> 100%)
      // ==============================================================
      const growT = THREE.MathUtils.smoothstep(p, 0.78, 1.0);
      communityLinesMat.opacity = growT * 0.8;

      let lineIdx = 0;
      communityNodes.forEach((node, idx) => {
        node.mesh.scale.set(growT, growT, growT);
        const currPos = node.targetPos.clone().multiplyScalar(growT);
        currPos.y += Math.sin(time * 1.2 + idx) * 0.06;
        node.mesh.position.copy(currPos);

        if (growT > 0.08 && lineIdx < maxCommunityLines * 6) {
          // Connect to anchor avatars
          const anchor = idx % 2 === 0 ? pA : pB;
          communityLinesPositions[lineIdx++] = anchor.x;
          communityLinesPositions[lineIdx++] = anchor.y;
          communityLinesPositions[lineIdx++] = anchor.z;
          communityLinesPositions[lineIdx++] = currPos.x;
          communityLinesPositions[lineIdx++] = currPos.y;
          communityLinesPositions[lineIdx++] = currPos.z;

          // Connect to neighbor
          const nextNode = communityNodes[(idx + 1) % totalCommunity];
          communityLinesPositions[lineIdx++] = currPos.x;
          communityLinesPositions[lineIdx++] = currPos.y;
          communityLinesPositions[lineIdx++] = currPos.z;
          communityLinesPositions[lineIdx++] = nextNode.mesh.position.x;
          communityLinesPositions[lineIdx++] = nextNode.mesh.position.y;
          communityLinesPositions[lineIdx++] = nextNode.mesh.position.z;
        }
      });
      communityLinesGeom.attributes.position.needsUpdate = true;

      // ==============================================================
      // 6. CINEMATIC CAMERA CHOREOGRAPHY ACROSS THE ENTIRE JOURNEY
      // ==============================================================
      // Continuous camera path:
      // 0.00: (0, 0.4, 5.6) - Wide opening environment flanking avatars
      // 0.25: (0, 0.15, 3.6) - Close dolly on converging avatars & 92% hub
      // 0.50: (1.3, 0.4, 3.4) - Dynamic 3D orbital sweep highlighting skill flight paths
      // 0.75: (0, 0.25, 4.0) - Centered collaboration resonance
      // 1.00: (0, 3.2, 12.8) - Dramatic cinematic pullback revealing global ecosystem
      let targetCamX = 0;
      let targetCamY = 0.4;
      let targetCamZ = 5.6;

      if (p <= 0.25) {
        const t = THREE.MathUtils.smoothstep(p, 0, 0.25);
        targetCamX = 0;
        targetCamY = THREE.MathUtils.lerp(0.4, 0.15, t);
        targetCamZ = THREE.MathUtils.lerp(5.6, 3.6, t);
      } else if (p <= 0.50) {
        const t = THREE.MathUtils.smoothstep(p, 0.25, 0.50);
        targetCamX = THREE.MathUtils.lerp(0, 1.3, t);
        targetCamY = THREE.MathUtils.lerp(0.15, 0.4, t);
        targetCamZ = THREE.MathUtils.lerp(3.6, 3.4, t);
      } else if (p <= 0.75) {
        const t = THREE.MathUtils.smoothstep(p, 0.50, 0.75);
        targetCamX = THREE.MathUtils.lerp(1.3, 0, t);
        targetCamY = THREE.MathUtils.lerp(0.4, 0.25, t);
        targetCamZ = THREE.MathUtils.lerp(3.4, 4.0, t);
      } else {
        const t = THREE.MathUtils.smoothstep(p, 0.75, 1.0);
        targetCamX = 0;
        targetCamY = THREE.MathUtils.lerp(0.25, 3.2, t);
        targetCamZ = THREE.MathUtils.lerp(4.0, 12.8, t);
      }

      // Add ambient idle sway and subtle mouse parallax
      const idleSwayX = prefersReducedMotion ? 0 : Math.sin(time * 0.4) * 0.12;
      const idleSwayY = prefersReducedMotion ? 0 : Math.cos(time * 0.3) * 0.08;
      const mouseParallaxX = mouse.x * 0.35;
      const mouseParallaxY = mouse.y * 0.25;

      const finalCamX = targetCamX + idleSwayX + mouseParallaxX;
      const finalCamY = targetCamY + idleSwayY + mouseParallaxY;
      const finalCamZ = targetCamZ;

      camera.position.set(finalCamX, finalCamY, finalCamZ);

      // Dynamic lookAt point
      const lookAtY = THREE.MathUtils.lerp(0, 0.2, p);
      camera.lookAt(0, lookAtY, 0);

      // Ambient celestial dust rotation
      dustParticles.rotation.y = time * 0.02;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // 15. Resize Observer
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [isDark]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 w-full h-full pointer-events-auto select-none z-0"
      aria-hidden="true"
    />
  );
}
